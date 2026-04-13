import { log } from "../core/logger/index.js";
import { criarEvento, aplicarRegraPorBatch, ENTIDADE, EVENTO, ORIGEM, evoluirEntidade } from "micro-agricultor";
import { cacheService, plantasService, canteirosService, eventosService, mutacoesService, batchService } from "../services/index.js";

export async function dailyEvolution() {
    log("Iniciando evolução de características de todo o banco de dados...")
    const user = { uid: "dailyEvolution", nome: ORIGEM.BACKEND.id };

    //TODO: usar o application evoluir!
    //Recupera as plantas e faz a evolução delas,
    //Recupera os canteiros e faz a evolução deles

    // Monta contexto da regra de evolução
    const cacheCaracteristicas = await cacheService.getCaracteristicas();
    const contexto = {
      mapaCaracteristicas: cacheCaracteristicas.map
    }

    //Monta evento
    const eventoRef = eventosService.getAppendRef();
    const eventoId = eventoRef.id;
    const timestamp = Date.now();
    const evento = criarEvento({
      tipoEvento: EVENTO.EVOLUCAO,
      timestamp,
      origem: {id: "dailyEvolution", tipo: ORIGEM.BACKEND.id},
      entidadesKey: [],
    })
    const entidadesKeySet = new Set();
    evento.id = eventoId;
    let commitEvento = false;

    //Monta o batch
    let batch = batchService.create();

    // =========
    // Primeiro, evolui as caracteristicas das plantas
    // =========
    const plantas = await plantasService.get([
      { field: "isDeleted", op: "==", value: false },
      { field: "isArchived", op: "==", value: false }
    ]);
    log(`${plantas.length} plantas para evoluir...`);
    for (const planta of plantas) {
      await batch.commitIfNeeded();

      const results = aplicarRegraPorBatch({
        tipoEntidadeId: ENTIDADE.planta.id,
        entidade: planta,
        regra: evoluirEntidade,
        contexto,
        serviceEntidade: plantasService,
        serviceMutacoes: mutacoesService,
        evento,
        batch,
        user,
      });

      // Sem mutações
      if (!results || !results.after) {
        continue;
      }
      // Com mutações
      entidadesKeySet.add(`planta:${planta.id}`);
      commitEvento = true;
    }

    // =========
    // Segundo, evolui as características dos canteiros
    // =========
    const canteiros = await canteirosService.get([
      { field: "isDeleted", op: "==", value: false },
      { field: "isArchived", op: "==", value: false }
    ]);
    log(`${canteiros.length} canteiros para evoluir...`);
    for (const canteiro of canteiros) {
      await batch.commitIfNeeded();

      const results = aplicarRegraPorBatch({
        tipoEntidadeId: ENTIDADE.canteiro.id,
        entidade: canteiro,
        regra: evoluirEntidade,
        contexto,
        serviceEntidade: canteirosService,
        serviceMutacoes: mutacoesService,
        evento,
        batch,
        user,
      });

      // Sem mutações
      if (!results || !results.after) {
        continue;
      }
      // Com mutações
      entidadesKeySet.add(`canteiro:${canteiro.id}`);
      commitEvento = true;
    }

    // =========
    // Terceiro, finaliza o evento
    // =========
    if (commitEvento) {
      evento.entidadesKey = Array.from(entidadesKeySet);
      batch.add((b)=>eventosService.batchUpsert(eventoRef, evento, user, b));
    }

    await batch.commit();

    log("Evolução de características concluída.")
    return;
}