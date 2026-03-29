import { criarEvento, aplicarRegraPorBatch, ENTIDADE, EVENTO, ORIGEM, evoluirCaracteristicas } from "micro-agricultor";
import { log } from "../core/logger/index.js";
import { db } from "../infra/firebase.js";
import { cacheService, plantasService, canteirosService, eventosService, mutacoesService } from "../services/index.js";

export async function dailyEffect() {
    console.log("Iniciando cálculo de efeitos do tempo...")
    const user = { uid: "dailyEffect", nome: ORIGEM.BACKEND.id };

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
      origem: {id: "dailyEffect", tipo: ORIGEM.BACKEND},
      entidadesKey: [],
    })
    const entidadesKeySet = new Set();
    evento.id = eventoId;
    let commitEvento = false;

    //Monta o batch
    let batch = db.batch(); //TODO: criar no service uma função
    let opCount = 0;
    async function commitIfNeeded (batch, opCount, force = false) {
      if (opCount > 450 || force) {
        await batch.commit();
        log(`${opCount} operações do batch salvas`);
        return { batch: db.batch(), opCount: 0 };
      }
      return { batch, opCount };      
    }

    // =========
    // Primeiro, evolui as caracteristicas das plantas
    // =========
    const plantas = await plantasService.get([
      { field: "isDeleted", op: "==", value: false },
      { field: "isArchived", op: "==", value: false }
    ]);
    log(`${plantas.length} plantas para processar`);
    for (const planta of plantas) {
      ({ batch, opCount } = await commitIfNeeded(batch, opCount));

      const results = aplicarRegraPorBatch({
        tipoEntidadeId: ENTIDADE.planta.id,
        entidade: planta,
        regra: evoluirCaracteristicas,
        contexto,
        serviceEntidade: plantasService,
        serviceMutacoes: mutacoesService,
        evento,
        batch,
        user,
      });

      // Sem mutações
      if (!results || !results.after) {
        log(`${planta.nome} (${planta.id}) sem mutações`);
        continue;
      }
      // Com mutações
      log(`${planta.nome} (${planta.id}) com ${Object.keys(results.after).length} mutações`);
      opCount += (results.opCount || 0);
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
    log(`${canteiros.length} canteiros para processar`);
    for (const canteiro of canteiros) {
      ({ batch, opCount } = await commitIfNeeded(batch, opCount));
    
      const results = aplicarRegraPorBatch({
        tipoEntidadeId: ENTIDADE.canteiro.id,
        entidade: canteiro,
        regra: evoluirCaracteristicas,
        contexto,
        serviceEntidade: canteirosService,
        serviceMutacoes: mutacoesService,
        evento,
        batch,
        user,
      });

      // Sem mutações
      if (!results || !results.after) {
        log(`${canteiro.nome} (${canteiro.id}) sem mutações`);
        continue;
      }
      // Com mutações
      log(`${canteiro.nome} (${canteiro.id}) com ${Object.keys(results.after).length} mutações`);
      opCount += (results.opCount || 0);
      entidadesKeySet.add(`canteiro:${canteiro.id}`);
      commitEvento = true;
    }

    // =========
    // Terceiro, finaliza o evento
    // =========
    if (commitEvento) {
      evento.entidadesKey = Array.from(entidadesKeySet);
      eventosService.batchUpsert(eventoRef, evento, user, batch);
      opCount++;
    }

    if (opCount > 0) {
      ({ batch, opCount } = await commitIfNeeded(batch, opCount, true));
    }

    console.log("Cálculo de efeitos do tempo concluído.")
    return;
}

dailyEffect();