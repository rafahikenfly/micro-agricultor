//import "module-alias/register.js"; // entry point (ESM)

import { onSchedule } from "firebase-functions/v2/scheduler";
import admin from "firebase-admin";

import { criarEfeitosDoEvento, criarEvento } from "./shared/domain/evento.rules.js";
import { calcularEvolucaoTemporalCanteiro, getNecessidadesCanteiro } from "./shared/domain/canteiro.rules.js";
import { calcularEvolucaoTemporalPlanta, getNecessidadesPlanta } from "./shared/domain/planta.rules.js";

import { createHistoryService } from "./shared/infra/historyFactory.js";
import { createCRUDService } from "./shared/infra/crudFactory.js";

import { SOURCE_TYPES } from "./shared/types/SOURCE_TYPES.js";
import { EVENTO_TYPES, EVENTO } from "./shared/types/EVENTO_TYPES.js";

import { firebaseAdapter } from "./firebaseAdapter.js";
import { getNecessidadeId } from "./shared/domain/necessidade.rules.js";



admin.initializeApp();
const db = admin.firestore();

const MAX_BATCH = 450;
/* ---------- Função agendada ---------- */
export const dailyMaintenance = onSchedule(
  {
    schedule: "0 3 * * *",
    timeZone: "America/Sao_Paulo",
  },
  async () => {
    const maintenanceTasks = [
      { name: "currentStateInspect", fn: currentStateInspect },
      // { name: "outraManutencao", fn: outraFuncao },
    ];

    try {
//      console.log("skip timeEffect()")
      await timeEffect();
    } catch (err) {
      console.error("Erro em timeEffect:", err);
    }
    const results = await Promise.allSettled([
//      console.log("skip currentStateInspect()");
      currentStateInspect()
      //...novas manutenções
    ]);

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Erro na função ${maintenanceTasks[index].name}:`, result.reason);
      }
    });
  }
  );

const timeEffect = async () => {
  const user = {uid: "timeEffect", nome: "firebase functions" }
  const timestamp = Date.now();

  console.log("Iniciando cálculo de efeitos do tempo");

  // Carrega catálogo de caracteristicas uma única vez
  const catalogoSnap = await db.collection("caracteristicas").get();
  const catalogo = catalogoSnap.docs.map(d => ({
    id: d.id,
    ...d.data(),
  }));

  // Monta services de histórico
  const eventosService = createHistoryService(firebaseAdapter, {
    collection: "eventos",
  });
  const canteirosService = createCRUDService(firebaseAdapter, {
    collection: "canteiros",
  })
  const plantasService = createCRUDService(firebaseAdapter, {
    collection: "plantas",
  })
  const historicoEfeitosService = createHistoryService(firebaseAdapter, {
    collection: "historicoEfeitos",
  });

  // Cria o evento
  const eventoRef = eventosService.getAppendRef();
  const eventoId = eventoRef.id;
  const evento = criarEvento({
    tipoEvento: EVENTO[EVENTO_TYPES.TIME],
    timestamp,
    origem: {id: "timeEffect", tipo: SOURCE_TYPES.FUNCTIONS},
    entidadesId: [],
    mutacoes: [],
  })
  evento.id = eventoId;
  
  const batch = db.batch();
  let opCount = 0;
  
  // ==========
  // Primeiro processa as plantas
  // ==========
  const plantasSnap = await db.collection("plantas").get();
  console.log(`${plantasSnap.docs.length} plantas para processar`);
  for (const plantaDoc of plantasSnap.docs) {
    const planta = plantaDoc.data()
    // ignora entidades mortas
    if (planta.isDeleted) continue;
    if (planta.isArchived) continue;        

    try {
      const mutation = calcularEvolucaoTemporalPlanta({
        planta,
        catalogo,
        timestamp,
        eventoId: evento.id
      });
      // adiciona alvo e efeitos
      const beforeFiltrado = Object.fromEntries(
        Object.keys(mutation.estadoAtual).map(key => [key, planta.estadoAtual[key]])
      );
      if (mutation && Object.keys(mutation.estadoAtual).length > 0) {
        evento.entidadesId.push(planta.id)
        evento.mutacoes.push({
          entidadeId: planta.id,
          tipoEntidadeId: "planta",
          before: {estadoAtual: beforeFiltrado},
          after: {estadoAtual: mutation.estadoAtual},
        })

        // Atualiza a planta pela mutação
        const plantaAtualizada = { ...planta, estadoAtual: {...planta.estadoAtual, ...mutation.estadoAtual}}
        
        // Adiciona update da planta no batch
        const ref = plantasService.getRefById(planta.id);
        plantasService.batchUpdate(ref, plantaAtualizada, user, batch);
        opCount++;
        console.log(`${planta.id} atualizada`)
      }
      else {
        console.log(`${planta.id} sem atualização`)
      }
    }
    catch (err) {
      console.log (`Erro calculando efeitos temporais da planta ${planta.id}:`, err);
    }
  }

  // ==========
  // Segundo processa os canteiros
  // ==========
  const canteirosSnap = await db.collection("canteiros").get();
  console.log(`${canteirosSnap.docs.length} canteiros para processar`);
  for (const canteiroDoc of canteirosSnap.docs) {
    const canteiro = canteiroDoc.data()
    // ignora entidades mortas
    if (canteiro.isDeleted) continue;
    if (canteiro.isArchived) continue;        

    try {
      const mutation = calcularEvolucaoTemporalCanteiro({
        canteiro,
        catalogo,
        timestamp,
        eventoId: evento.id
      });
      // adiciona alvo e efeitos
      const beforeFiltrado = Object.fromEntries(
        Object.keys(mutation.estadoAtual).map(key => [key, canteiro.estadoAtual[key]])
      );
      if (mutation && Object.keys(mutation.estadoAtual).length > 0) {
        evento.entidadesId.push(canteiro.id)
        evento.mutacoes.push({
          entidadeId: canteiro.id,
          tipoEntidadeId: "canteiro",
          before: {estadoAtual: beforeFiltrado},
          after: {estadoAtual: mutation.estadoAtual},
        })

        // Atualiza o canteiro pela mutação
        const canteiroAtualizado = { ...canteiro, estadoAtual: {...canteiro.estadoAtual, ...mutation.estadoAtual}}
        
        // Adiciona update do canteiro no batch
        const ref = canteirosService.getRefById(canteiro.id);
        canteirosService.batchUpdate(ref, canteiroAtualizado, user, batch);
        opCount++;
        console.log(`${canteiro.id} atualizado`)
      }
      else {
        console.log(`${canteiro.id} sem atualização`)
      }
    }
    catch (err) {
      console.log (`Erro calculando efeitos temporais do canteiro ${canteiro.id}:`, err);
    }
  }


  // gera efeitos históricos
  const efeitos = criarEfeitosDoEvento({evento});
  for (const efeito of efeitos) {
    historicoEfeitosService.batchAppend(efeito, user, batch);
    opCount++;
  }

  // inclui o evento no batch se houver mudanças
  if (efeitos.length) {
    eventosService.batchUpsert(eventoRef, evento, user, batch);
    opCount++;
  }

  // ===
  // IMPORTANTE TODO: PRECISO CONTROLAR O TAMANHO DO COMMIT QUANDO EU
  // TIVER 70 PLANTAS + CANTEIROS COM 7 CARACTERISTICAS CADA
  // IMPORTANTE TODO: QUANDO TIVER MUITOS CANTEIROS E PLANTAS, PRECISO
  // ME PREOCUPAR COM O GET DESSAS COLECOES.
  // ====
  // faz o commit
  if (opCount > 0) {
    await batch.commit();
  }
}
const currentStateInspect = async () => {
  //TODO: Tem uma regra de negócio acoplada na leitura dos fingerpirnts ativos
  //TODO: Melhorar a descrição de nova tarefa (caracteristicaNome e entidadeNome)

  const user = {uid: "currentStateInspect", nome: "firebase functions" }
  const timestamp = Date.now();

  console.log("Iniciando inspeção de estados atuais...");

  // Carrega o catálogo de necessidades não atendidas registradas
  const snapNecessidades = await db.collection("necessidades").get();
  const mapaNecessidades = {};
  snapNecessidades.docs.forEach(doc => {
    const entidadeId = doc.id;
    const data = doc.data();

    mapaNecessidades[entidadeId] = data;
  });

  // Carrega catálogo de variedades uma única vez
  const variedadesSnap = await db.collection("variedades").get();
  const catalogoVariedades = variedadesSnap.docs.map(d => ({
    id: d.id,
    ...d.data(),
  }));

  // Carrega mapa de características uma única vez para enriquecer contexto
  const caracteristicasSnap = await db.collection("caracteristicas").get();
  const caracteristicasMap = new Map();
  caracteristicasSnap.forEach(doc => {
    caracteristicasMap.set(doc.id, {
      id: doc.id,
      ...doc.data()
    });
  });

  // Carega plantas
  const plantasSnap = await db.collection("plantas").get();

  // Carrega canteiros
  const canteirosSnap = await db.collection("canteiros").get();


  const novasTarefas = [];
  const novasNecessidades = [];

  // inicializa o mapa de tarefas
  const mapaTarefas = {}

  // Avalia as plantas e preenche o array de plantas
  console.log(`${plantasSnap.docs.length} plantas para inspecionar...`);
  const plantas = [];
  for (const plantaDoc of plantasSnap.docs) {
    const planta = { id: plantaDoc.id, ...plantaDoc.data() };
    plantas.push(planta)
    novasNecessidades.push(...getNecessidadesPlanta({
      planta,
      timestamp,
      mapaTarefas,
      mapaNecessidades,
      catalogoVariedades,
      caracteristicasMap
    }))
  }

  //Avalia os canteiros (consome o array de plantas) e inclui
  //todas as necessidades ao array de necessidades.
  console.log(`${canteirosSnap.docs.length} canteiros para inspecionar`);
  for (const canteiroDoc of canteirosSnap.docs) {
    const canteiro = { id: canteiroDoc.id, ...canteiroDoc.data() };
    novasNecessidades.push(...getNecessidadesCanteiro({
      canteiro,
      plantas,
      timestamp,
      mapaTarefas,
      mapaNecessidades,
      catalogoVariedades,
      caracteristicasMap
    }));
  }

  //Converte o mapa de tarefas em um array e cria os Ids no mapa
  novasTarefas.push(...Object.values(mapaTarefas));
  console.log(`${novasTarefas.length} novas tarefas`);

  //Monta os serviços
  const tarefasService = createCRUDService(firebaseAdapter, {
    collection: "tarefas"
  });
  const necessidadesService = createCRUDService(firebaseAdapter, {
    collection: "necessidades"
  })

  //Salva as tarefas
  console.log(`Salvando tarefas e necessidades...`)
  let batch = db.batch();
  let opCount = 0;
  for (const tarefa of novasTarefas) {
    //Gera o ref da tarefa
    const tarefaRef = tarefasService.getCreateRef();
    const tarefaId = tarefaRef.id;

    //Inclui tarefa no batch
    tarefasService.batchUpsert(
      tarefaRef,
      tarefa,
      user,
      batch
    );
    opCount++;

    // filtra necessidades dessa tarefa
    const necessidadesDaTarefa =
      novasNecessidades.filter(
        n => n.caracteristicaId === tarefa.contexto.caracteristicaId
      );

    // vincula e inclui as necessidade da tarefa no batch
    for (const necessidade of necessidadesDaTarefa) {

      const necessidadeVinculada = {
        ...necessidade,
        vinculo: {
          tipo: "tarefa",
          id: tarefaId
        }
      };

      //Inclui necessidade no batch
      const necessidadeId = getNecessidadeId({
        entidadeId: necessidadeVinculada.entidadeId,
        caracteristicaId: necessidadeVinculada.caracteristicaId,
        tipoEventoId: necessidadeVinculada.tipoEventoId
      })
      const necessidadeRef = necessidadesService.getRefById(necessidadeId);
      necessidadesService.batchUpsert(
        necessidadeRef,
        necessidadeVinculada,
        user,
        batch
      );
      opCount++;
    }

    if (opCount >= MAX_BATCH) {
      await batch.commit();
      batch = db.batch();
      opCount = 0;
    }
  }
  if (opCount > 0) await batch.commit();
  console.log(`Manutenção diária concluída.`)
}

