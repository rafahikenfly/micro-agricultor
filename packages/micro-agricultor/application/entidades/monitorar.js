import { EVENTO, ORIGEM, ENTIDADE } from "../../types/index.js";

import { criarEvento } from "../../domain/evento.rules.js";
import { atenderNecessidade, getNecessidadeKey } from "../../domain/necessidade.rules.js";
import { monitorarPlanta } from "../../domain/planta.rules.js";
import { aplicarRegraPorBatch } from "../batch.js";
import { monitorarCanteiro } from "../../domain/canteiro.rules.js";

const mapTipoEntidadeRegra = {
  [ENTIDADE.planta.id]: monitorarPlanta,
  [ENTIDADE.canteiro.id]: monitorarCanteiro,
}

/**
 * Aplica monitoramento em múltiplas entidades e suas características.
 *
 * @param {Object} args
 * @param {string} args.tipoEntidadeId - Tipo da entidade (ex: planta, sensor, etc)
 * @param {Array<Object>} args.entidades - Lista de entidades a serem processadas
 * @param {User} [args.user] - Usuário responsável pela operação (Default: {uid: "monitorar", nome: ORIGEM.FRONTEND.id})
 * @param {number} [args.timestamp] - Timestamp da execução (default: Date.now)
 * @param {Object<string, Object<string, {valor: number, confianca?: number}>>} args.medidas
 * Mapa de medidas no formato:
 * {
 *   [entidadeId]: {
 *     [caracteristicaId]: {
 *       valor: number,
 *       confianca?: number
 *     }
 *   }
 * }
 *
 * @param {Object} args.services
 * @param {Object} args.services.batch - Service de batch
 * @param {Object} args.services.eventos - Service de eventos
 * @param {Object} args.services.entidade - Service da entidade
 * @param {Object} args.services.mutacoes - Service de mutações
 * @param {Object} args.services.necessidades - Service de necessidades
 *
 * @returns {Promise<void>}
 */
export async function monitorar({
  tipoEntidadeId,         // ENTIDADE.TIPO.id
  entidades,              // object[]
  medidas,                // {{entidadeId: {caracteristicaId: {valor, confianca}}}}
  timestamp,              // integer
  user,                   // Object user
  services                // {batch, eventos, entidade, mutacoes, necessidades}
}) {

  // Normaliza argumentos
  if (!entidades?.length) {
    throw new Error(`Nenhuma entidade para monitoramento.`)
  };
  if (!tipoEntidadeId) {
    throw new Error("Tipo de entidade não informado para monitoramento.");
  };
  const regra = mapTipoEntidadeRegra[tipoEntidadeId];
  if (!regra) {
    throw new Error(`Nenhuma regra de monitoramento para tipo ${tipoEntidadeId}`);
  }
  console.log(`Monitorando ${entidades.length} ${tipoEntidadeId}(s)...`);

  if (!user) user = { uid: "monitorar", nome: ORIGEM.FRONTEND.id };
  if (!timestamp) timestamp = Date.now();

  //Monta evento
  const eventoRef = services.eventos.getAppendRef();
  const eventoId = eventoRef.id;
  const evento = criarEvento({
    tipoEvento: EVENTO.MONITORAMENTO,
    timestamp,
    origem: {id: "monitorar", tipo: ORIGEM.FRONTEND.id},
    entidadesKey: [],
  })
  const entidadesKeySet = new Set();
  evento.id = eventoId;
  let commitEvento = false;
  let batch = services.batch.create();
  
  // Processa cada entidade do array
  for (const entidade of entidades) {
    await batch.commitIfNeeded();

    // Monta contexto da regra de monitoramento
    // (argumento medidas é um objeto = {[entidade.id]: {[caracteristicaId]: {}}} )
    const medidasEntidade = medidas[entidade.id];
    if (!medidasEntidade) continue;
    const contexto = {
      medidas: medidasEntidade
    }

    // ======
    // Entidade
    // ======        
    // Aplica regra de dominio de monitoramento adequada
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

    // ======
    // Necessidades
    // ======
    // Atualiza a necessidade de monitoramento de cada característica da entidade,
    // Se existente. Se não existe a necessidade, não precisa criar, então passa para
    // a proxima necessidade
    // TODO: para melhorar a performance, é possível recuperar até 10 ids com a mesma consulta usando o getByEntidadesArray do mesmo service. Tem que ver as implicações no resto da função.
    const necessidades = await services.necessidades.get([
      { field: "entidadeId", op: "==", value: entidade.id }
    ]);
    const necessidadesMap = Object.fromEntries(
      necessidades.map(n => [n.id, n])
    );

    for (const caracteristicaId of Object.keys(medidasEntidade)) {
      await batch.commitIfNeeded();

      // Recupera a necessidade, se existente
      const necessidadeId = getNecessidadeKey({
        entidadeId: entidade.id,
        caracteristicaId,
        tipoEventoId: EVENTO.MONITORAMENTO.id,
      });
      const necessidade = necessidadesMap[necessidadeId];

      // Verifica se há a necessidade. Casos em que não há a necessidade
      if (!necessidade) {
        console.warn(`${entidade.id} sem necessidade de monitoramento de caracteristica ${caracteristicaId}.`)
        continue;
      }

      // Atualiza a necessidade
      const necessidadeAtualizada = atenderNecessidade({
        necessidade,
        agente: {uid: user.uid, tipo: ORIGEM.USER.id}, //TODO: nem sempre o monitoramento vem do usuário!
        timestamp
      });

      // Inclui no batch se houver atualização
      if (necessidadeAtualizada) {
        const necessidadeRef = services.necessidades.getRefById(necessidadeId);
        batch.add((b)=>services.necessidades.batchUpsert(necessidadeRef, necessidadeAtualizada, user, b));
      }
    };
  };

  // Finaliza o evento
  if (commitEvento) {
    evento.entidadesKey = Array.from(entidadesKeySet);
    batch.add((b)=>services.eventos.batchUpsert(eventoRef, evento, user, b));
  }

  // Commit final
  await batch.commit();

  console.log("Monitoramento de entidades concluído.");
  return;
}