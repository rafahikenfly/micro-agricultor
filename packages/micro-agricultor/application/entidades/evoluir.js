import { evoluirPlanta, evoluirCanteiro } from "../../domain";
import { EVENTO, ORIGEM } from "../../types";
import { aplicarRegraPorBatch } from "../batch";

const mapTipoEntidadeRegra = {
  [ENTIDADE.planta.id]: evoluirPlanta,
  [ENTIDADE.canteiro.id]: evoluirCanteiro,
}

/**
 * Aplica evolução (efeitos do tempo) em múltiplas entidade de um tipo.
 *
 * @param {Object} args
 * @param {string} args.tipoEntidadeId - Tipo da entidade (ex: planta, sensor, etc)
 * @param {Array<Object>} args.entidades - Lista de entidades a serem processadas
 * @param {User} [args.user] - Usuário responsável (default: backend)
 * @param {number} [args.timestamp] - Timestamp da execução (default: Date.now)
 *
 * @param {Object} args.services
 * @param {Object} args.services.batch - Service de batch (createBatch)
 * @param {Object} args.services.eventos - Service de eventos
 * @param {Object} args.services.entidade - Service da entidade
 * @param {Object} args.services.mutacoes - Service de mutações
 * @param {Object} args.services.cache - Service de cache (getCaracteristicas)
 *
 * @returns {Promise<void>}
 */
export async function evoluir({
  tipoEntidadeId,
  entidades,
  user,
  timestamp,
  services
}) {

  // Normaliza argumentos
  if (!entidades?.length) {
    throw new Error("Nenhuma entidade para evoluir.");
  }
  if (!tipoEntidadeId) {
    throw new Error("Tipo de entidade não informado para evolução.");
  }
  const regra = mapTipoEntidadeRegra[tipoEntidadeId];
  if (!regra) {
    throw new Error(`Nenhuma regra de evolução para tipo ${tipoEntidadeId}`);
  }

  console.log(`Iniciando evolução de ${entidades.length} ${tipoEntidadeId}s...`);
  if (!user) user = { uid: "evoluir", nome: ORIGEM.BACKEND.id };
  if (!timestamp) timestamp = Date.now();

  //Monta evento
  const eventoRef = services.eventos.getAppendRef();
  const eventoId = eventoRef.id;

  const evento = criarEvento({
    tipoEvento: EVENTO.EVOLUCAO,
    timestamp,
    origem: { id: "evoluir", tipo: ORIGEM.BACKEND.id },
    entidadesKey: [],
  });
  
  evento.id = eventoId;
  const entidadesKeySet = new Set();
  let commitEvento = false;
  const batch = services.batch.createBatch();

  // Monta contexto da regra de evolução
  const cacheCaracteristicas = await services.cache.getCaracteristicas();
  const contexto = {
      mapaCaracteristicas: cacheCaracteristicas.map
  }

  // Processa cada entidade do array
  for (const entidade of entidades) {
    await batch.commitIfNeeded();

    // Aplica regra de dominio de evolução adequada
    const results = aplicarRegraPorBatch({
      tipoEntidadeId,
      entidade,
      regra,
      contexto,
      serviceEntidade: services.entidade,
      serviceMutacoes: services.mutacoes,
      evento,
      batch,
      user,
    });

    // Resultado sem mutações
    if (!results.after) {
      console.log(`${entidade.nome} (${entidade.id}) sem mutações`);
      continue;
    }

    // Resultado com mutações
    console.log(`${entidade.nome} (${entidade.id}) com ${Object.keys(results.after).length} mutações`);
    entidadesKeySet.add(`${tipoEntidadeId}:${entidade.id}`);
    commitEvento = true;
  };

  // Finaliza o evento
  if (commitEvento) {
    evento.entidadesKey = Array.from(entidadesKeySet);

    batch.add((b) =>
      services.eventos.batchUpsert(eventoRef, evento, user, b)
    );
  }

  // Commit final
  await batch.commit();

  console.log("Evolução de entidades concluída.");
}