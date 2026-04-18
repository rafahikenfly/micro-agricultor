import { atenderNecessidade, criarEvento, getNecessidadeKey, manejarCanteiro, manejarPlanta } from "../../domain/index.js";
import { EVENTO, ORIGEM, ENTIDADE } from "../../types/index.js";
import { aplicarRegraPorBatch } from "../index.js";


const mapTipoEntidadeManejo = {
  [ENTIDADE.planta.id]: manejarPlanta,
  [ENTIDADE.canteiro.id]: manejarCanteiro,
}

/**
 * Aplica efeitos do manejo em múltiplas entidades de um tipos.
 *
 * @param {Object} args
 * @param {string} args.tipoEntidadeId - Tipo da entidade (ex: planta, sensor, etc)
 * @param {Array<Object>} args.entidades - Lista de entidades a serem processadas
 * @param {Manejo} args.manejo - Manejo a ser aplicado
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

export async function manejar({
  tipoEntidadeId,
  entidades,
  manejo,
  intervencoes,   // {entidadeId: {...}}
  timestamp,
  user,
  services
}) {

  // Normaliza argumentos
  if (!entidades?.length) {
    throw new Error(`Nenhuma entidade para manejar.`);
  }
  if (!tipoEntidadeId) {
    throw new Error("Tipo de entidade não informado para manejo.");
  }
  if (!manejo) {
    throw new Error("Manejo não informado para manejo.");
  }
  const regra = mapTipoEntidadeManejo[tipoEntidadeId];
  if (!regra) {
    throw new Error(`Nenhuma regra de manejo para tipo ${tipoEntidadeId}`);
  }

  console.log(`Manejando ${manejo.nome} de ${entidades.length} ${tipoEntidadeId}(s)...`);
  if (!user) user = { uid: "manejar", nome: ORIGEM.FRONTEND.id };
  if (!timestamp) timestamp = Date.now();

  //Monta evento
  const eventoRef = services.eventos.getAppendRef();
  const eventoId = eventoRef.id;

  const evento = criarEvento({
    tipoEvento: EVENTO.MANEJO,
    timestamp,
    origem: { id: "manejar", tipo: ORIGEM.FRONTEND.id },
    entidadesKey: [],
  });

  evento.id = eventoId;
  const entidadesKeySet = new Set();
  let commitEvento = false;
  let batch = services.batch.create();

  // Processa cada entidade do array
  for (const entidade of entidades) {
    await batch.commitIfNeeded();

    const intervencoesEntidade = intervencoes?.[entidade.id];

    const contexto = {
      manejo,
      intervencoes: intervencoesEntidade
    };

    // ======
    // Entidade
    // ======
    // Aplica regra de dominio de manejo adequada
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
    // Atualiza a necessidade de manejo de cada característica da entidade
    // TODO: para melhorar a performance, é possível recuperar até 10 ids com a mesma consulta usando o getByEntidadesArray do mesmo service. Tem que ver as implicações no resto da função.
    const necessidades = await services.necessidades.getByEntidade(entidade.id);
    const necessidadesMap = Object.fromEntries(
      necessidades.map(n => [n.id, n])
    );
    const listaNecessidades = [
      ...Object.keys(results.after),
      manejo.id
    ]; // Características afetadas + manejo


    for (const caracteristicaId of listaNecessidades) {
      await batch.commitIfNeeded();
      // Recupera a necessidade
      const necessidadeId = getNecessidadeKey({
        entidadeId: entidade.id,
        caracteristicaId,
        tipoEventoId: EVENTO.MANEJO.id,
      });
      const necessidade = necessidadesMap[necessidadeId];

      // Atualiza a necessidade
      const necessidadeAtualizada = atenderNecessidade({
        necessidade,
        agente: { uid: user.uid, tipo: ORIGEM.USER.id },
        timestamp
      });

      // Inclui no batch se houver atualização
      if (necessidadeAtualizada) {
        const ref = services.necessidades.getRefById(necessidadeId);
        batch.add((b) => services.necessidades.batchUpsert(ref, necessidadeAtualizada, user, b));
      }
    }
  }

  // Finaliza evento
  if (commitEvento) {
    evento.entidadesKey = Array.from(entidadesKeySet);
    batch.add((b) =>services.eventos.batchUpsert(eventoRef, evento, user, b));
  }

  await batch.commit();

  console.log("Manejo concluído.");
}