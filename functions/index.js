//import "module-alias/register.js"; // entry point (ESM)

import { onSchedule } from "firebase-functions/v2/scheduler";
import admin from "firebase-admin";

import { criarEfeitosDoEvento, criarEvento } from "./shared/domain/evento.rules.js";
import { calcularEvolucaoTemporalCanteiro, getCaracteristicasRelevantesCanteiro, getPendenciasCanteiro } from "./shared/domain/canteiro.rules.js";
import { calcularEvolucaoTemporalPlanta, getCaracteristicasRelevantesPlanta, getPendenciasPlanta } from "./shared/domain/planta.rules.js";
import { criarTarefa } from "./shared/domain/tarefa.rules.js";

import { createHistoryService } from "./shared/infra/historyFactory.js";
import { createCRUDService } from "./shared/infra/crudFactory.js";

import { SOURCE_TYPES } from "./shared/types/SOURCE_TYPES.js";
import { EVENTO_TYPES, EVENTO } from "./shared/types/EVENTO_TYPES.js";
import { JOBSTATE_TYPES } from "./shared/types/JOBRUN_STATE.js";

import { firebaseAdapter } from "./firebaseAdapter.js";



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
      { name: "taskInspect", fn: taskInspect },
      // { name: "outraManutencao", fn: outraFuncao },
    ];

    try {
//      console.log("skip timeEffect()")
      await timeEffect();
    } catch (err) {
      console.error("Erro em timeEffect:", err);
    }
    const results = await Promise.allSettled([
//      console.log("skip taskInspect()")
      taskInspect()
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
    alvos: [],
    efeitos: [],
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
        evento.alvos.push(planta.id)
        evento.efeitos.push({
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
        evento.alvos.push(canteiro.id)
        evento.efeitos.push({
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
const taskInspect = async () => {
  //TODO: Tem uma regra de negócio acoplada na leitura dos fingerpirnts ativos
  //TODO: Melhorar a descrição de nova tarefa (caracteristicaNome e entidadeNome)

  const user = {uid: "taskInspect", nome: "firebase functions" }
  const timestamp = Date.now();

  console.log("Iniciando inspeção de tarefas...");

  // Carrega o catálogo de tarefas não resolvidas
  const tarefasSnap = await db.collection("tarefas")
  .where("estado", "==", JOBSTATE_TYPES.PENDING)
  .get();
  
  const fingerprintsPendentes = new Set(
    tarefasSnap.docs
    .map(doc => doc.data())
    .filter(t => t.isDeleted !== true && t.fingerprint)
//    .filter(t => t.isArchived !== true) // considera undefined como false
//    ...outras regras que definem o que é uma pendência ativa
    .map(t => t.fingerprint)
  );

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

  const novasTarefas = []
  
  //TODO: está misturada essa lógica de alvo com objeto do array. Aqui funciona pq tenho certeza que é um
  // alvo único, mas e quando não for?
  const taskInspectCanteiros = ({canteiro, plantas, catalogoVariedades, caracteristicasMap}) => {
    const plantasArr = plantas.filter((p)=> p.canteiroId === canteiro.id)
    const arrCaracteristicaIds = getCaracteristicasRelevantesCanteiro({plantas: plantasArr, catalogoVariedades})
    const pendencias = getPendenciasCanteiro({canteiro, arrCaracteristicaIds});
    console.log(`${pendencias.length} pendências para ${canteiro.id}`);
    for (const contexto of pendencias) {
      const fingerprint = [
        contexto.tipoEntidadeId,
        [...contexto.alvos].sort().join("-"),
        contexto.caracteristicaId,
        contexto.motivo
      ].join("_");
      if (!fingerprintsPendentes.has(fingerprint)) {
        // obtem a caracteristica
        const caracteristica =
          caracteristicasMap.get(contexto.caracteristicaId);        
        // enriquece o contexto
        const contextoEnriquecido = {
            ...contexto,
            caracteristicaNome: caracteristica.nome ?? contexto.caracteristicaId,
            alvos: contexto.alvos.map(id => ({
              id,
              nome: canteiro.nome,
            }))
          }
        // salva no array
        novasTarefas.push(criarTarefa({
          contexto: contextoEnriquecido,
          planejamento: {
            vencimento: timestamp,
            recomendacao: EVENTO_TYPES.MONITOR,
            prioridade: 1},
          dados: {
            nome: `Monitorar ${contextoEnriquecido.caracteristicaNome} em ${canteiro.nome}`,
            fingerprint
          }}))
        fingerprintsPendentes.add(fingerprint);
      }
    }
  }

  //TODO: está misturada essa lógica de alvo com objeto do array. Aqui funciona pq tenho certeza que é um
  // alvo único, mas e quando não for?
  const taskInspectPlantas = ({planta, catalogoVariedades, caracteristicasMap}) => {
    const arrCaracteristicaIds = getCaracteristicasRelevantesPlanta({planta, catalogoVariedades})
    const pendencias = getPendenciasPlanta({planta, arrCaracteristicaIds});
    console.log(`${pendencias.length} pendências para ${planta.id}`);
    for (const contexto of pendencias) {
      const fingerprint = [
        contexto.tipoEntidadeId,
        [...contexto.alvos].sort().join("-"),
        contexto.caracteristicaId,
        contexto.motivo
      ].join("_");
      if (!fingerprintsPendentes.has(fingerprint)) {
        // obtem a caracteristica
        const caracteristica =
          caracteristicasMap.get(contexto.caracteristicaId);        
        // enriquece o contexto
        const contextoEnriquecido = {
            ...contexto,
            caracteristicaNome: caracteristica.nome ?? contexto.caracteristicaId,
            alvos: contexto.alvos.map(id => ({
              id,
              nome: planta.nome,
            }))
          }
        // salva no array
        novasTarefas.push(criarTarefa({
          contexto: contextoEnriquecido,
          planejamento: {
            vencimento: timestamp,
            recomendacao: EVENTO_TYPES.MONITOR,
            prioridade: 1},
          dados: {
            nome: `Monitorar ${contextoEnriquecido.caracteristicaNome} em ${planta.nome}`,
            fingerprint
          }}))
        fingerprintsPendentes.add(fingerprint);
      }
    }
  }

  const plantas = []
  const plantasSnap = await db.collection("plantas").get();
  console.log(`${plantasSnap.docs.length} plantas para avaliar`);
  for (const plantaDoc of plantasSnap.docs) {
    const planta = { id: plantaDoc.id, ...plantaDoc.data() };
    plantas.push(planta)
    taskInspectPlantas({planta, catalogoVariedades, caracteristicasMap})
  }
  const canteirosSnap = await db.collection("canteiros").get();
  console.log(`${canteirosSnap.docs.length} canteiros para avaliar`);
  for (const canteiroDoc of canteirosSnap.docs) {
    const canteiro = { id: canteiroDoc.id, ...canteiroDoc.data() };
    taskInspectCanteiros({canteiro, plantas, catalogoVariedades, caracteristicasMap})
  }

  //Monta os serviços
  const tarefasService = createCRUDService(firebaseAdapter, {
    collection: "tarefas"
  });

  console.log(`${novasTarefas.length} novas tarefas`)
  let batch = db.batch();
  let opCount = 0;
  for (const tarefa of novasTarefas) {
    tarefasService.batchCreate(tarefa, user, batch);
    opCount++;

    if (opCount >= MAX_BATCH) {
      await batch.commit();
      batch = db.batch();
      opCount = 0;
    }
  }

  if (opCount > 0) await batch.commit()
}

