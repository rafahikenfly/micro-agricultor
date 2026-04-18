import { getNecessidadeKey, getNecessidadesCanteiro, getNecessidadesPlanta, ORIGEM } from "micro-agricultor";
import { batchService, tarefasService, necessidadesService, cacheService } from "../services/index.js";
import { log } from "../core/logger/index.js";

export async function currentStateInspector() {
  log("[currentStateInspector]: Iniciando inspeção de estados atuais...");
  const user = { uid: "currentStateInspector", nome: ORIGEM.BACKEND.id };
  const timestamp = Date.now();

  //TODO: Tem uma regra de negócio acoplada na leitura dos fingerpirnts ativos
  //TODO: Melhorar a descrição de nova tarefa (caracteristicaNome e entidadeNome)
  const cacheCaracteristicas = await cacheService.getCaracteristicas();
  const cacheVariedades = await cacheService.getVariedades();
  const cacheNecessidades = await cacheService.getNecessidades();
  const cachePlantas = await cacheService.getPlantas();
  const cacheCanteiros = await cacheService.getCanteiros();
  
  // inicializa o mapa de tarefas
  const novasNecessidades = [];
  const mapaTarefas = {}

  // Avalia as plantas, mutando o contexto (mapaTarefas), e inclui
  // todas as necessidades ao array de necessidades.
  log(`[currentStateInspector]: ${cachePlantas.list.length} plantas para inspecionar...`);
  for (const planta of cachePlantas.list) {
    novasNecessidades.push(...getNecessidadesPlanta({
      planta,
      timestamp,
      contexto: { mapaTarefas },
      mapaNecessidades: cacheNecessidades.map,
      mapaVariedades: cacheVariedades.map,       
      mapaCaracteristicas: cacheCaracteristicas.map
    }))
  }

  // Avalia os canteiros, mutando o contexto (mapaTarefas), e inclui
  // todas as necessidades ao array de necessidades.
  log(`[currentStateInspector]: ${cacheCanteiros.list.length} canteiros para inspecionar`);
  for (const canteiro of cacheCanteiros.list) {
    novasNecessidades.push(...getNecessidadesCanteiro({
      canteiro,
      plantas: cachePlantas.list,
      timestamp,
      contexto: { mapaTarefas },
      mapaNecessidades: cacheNecessidades.map,
      mapaVariedades: cacheVariedades.map,
      mapaCaracteristicas: cacheCaracteristicas.map
    }));
  }

  // Converte o mapa de tarefas em um array e cria os Ids no mapa
  const novasTarefas = Object.values(mapaTarefas);
  log(`[currentStateInspector]: Salvando ${novasTarefas.length} nova(s) tarefa(s) e respectivas necessidades.`);
  let batch = batchService.create();

  // Mapeia as necessidades por caracteristica
  const necessidadesPorCaracteristica = {};
  for (const n of novasNecessidades) {
    if (!necessidadesPorCaracteristica[n.caracteristicaId]) {
      necessidadesPorCaracteristica[n.caracteristicaId] = [];
    }
    necessidadesPorCaracteristica[n.caracteristicaId].push(n);
  }

  // Gera as tarefas no batch
  for (const tarefa of novasTarefas) {
    await batch.commitIfNeeded();

    //Gera o ref da tarefa
    const newRef = tarefasService.getCreateRef();
    tarefa.id = newRef.id;

    //Inclui tarefa no batch
    batch.add((b)=>tarefasService.batchCreate(tarefa, user, b, newRef));

    // Vincula as necessidades da tarefa e inclui no batch
    const necessidadesDaTarefa =
      necessidadesPorCaracteristica[tarefa.contexto.caracteristicaId] || [];
    for (const necessidade of necessidadesDaTarefa) {
      const necessidadeVinculada = {
        ...necessidade,
        vinculo: {
          tipo: "tarefa",
          id: tarefa.id
        }
      };

      //Inclui necessidade no batch
      const necessidadeKey = getNecessidadeKey({
        entidadeId: necessidadeVinculada.entidadeId,
        caracteristicaId: necessidadeVinculada.caracteristicaId,
        tipoEventoId: necessidadeVinculada.tipoEventoId
      });
      const necessidadeRef = necessidadesService.getRefById(necessidadeKey);
      //Inclui necessidade no batch
      batch.add((b)=>necessidadesService.batchCreate(necessidadeVinculada, user, b, necessidadeRef));
    };
  };
  await batch.commit();
  log(`[currentStateInspector]: Inspeção de estados atuais (plantas e canteiros) concluída.`);
}