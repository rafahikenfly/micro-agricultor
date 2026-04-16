import { ENTIDADE, EVENTO, ORIGEM } from "../../types/index.js";
import { criarEvento } from "../../domain/evento.rules.js";
import { derivarPlanta } from "../../domain/planta.rules.js";
import { aplicarRegraPorBatch } from "../batch.js";

const mapTipoEntidadeRegra = {
  [ENTIDADE.planta.id]: derivarPlanta,
//  [ENTIDADE.canteiro.id]: movimentarCanteiro,
}

/**
 * Implanta múltiplas entidades em diferentes posições.
 *
 * @param {Object} args
 * @param {string} args.tipoEntidadeId
 * @param {Object} args.implantacao
 * @param {Array<Object>} args.posicoes
 * @param {Object} [args.canteiro]
 * @param {Object} [args.especie]
 * @param {Object} [args.variedade]
 * @param {Object} [args.tecnica]
 *   [
 *     {x, y, z}
 *   ]
 * @param {Object} args.services
 * @param {Object} args.services.batch
 * @param {Object} args.services.eventos
 * @param {Object} args.services.entidade
 * @param {Object} args.services.mutacoes
 * @param {Object} [args.user]
 * @param {number} [args.timestamp]
 *
 * @returns {Promise<void>}
 */
export async function derivar({
  tipoEntidadeId,
  posicoes,
  canteiro,
  especie,
  variedade,
  tecnica,
  services,
  user,
  timestamp
}) {

  // ======
  // Validações
  // ======
  if (!posicoes.length) {
    throw new Error("Nenhuma posição para implantação.");
  }
  if (!tipoEntidadeId) {
    throw new Error("Tipo de entidade não informado.");
  }
  const regra = mapTipoEntidadeRegra[tipoEntidadeId];
  if (!regra) {
    throw new Error(`Nenhuma regra de implantação para tipo ${tipoEntidadeId}`);
  }
  console.log(`Implantando ${posicoes.length} ${tipoEntidadeId}(s)...`);

  if (!user) user = { uid: "implantar", nome: ORIGEM.FRONTEND.id };
  if (!timestamp) timestamp = Date.now();

  // ======
  // Evento
  // ======
  const eventoRef = services.eventos.getAppendRef();
  const eventoId = eventoRef.id;

  const evento = criarEvento({
    tipoEvento: EVENTO.IMPLANTACAO,
    timestamp,
    origem: { id: "implantar", tipo: ORIGEM.FRONTEND.id },
    entidadesKey: [],
  });
  evento.id = eventoId;
  const entidadesKeySet = new Set();
  let commitEvento = false;
  let batch = services.batch.create();

  // Processa cada entidade do array
  for (const posicao of posicoes) {
    await batch.commitIfNeeded();

    const contexto = {
      posicao,
      canteiro,   // necessario para derivarPlanta
      especie,    // necessario para derivarPlanta
      tecnica,    // necessario para derivarPlanta
      variedade,  // necessario para derivarPlanta
    }

    // ======
    // Entidade
    // ======
    // Aplica regra de dominio de implantação adequada
    const results = aplicarRegraPorBatch({
      tipoEntidadeId,
      regra,
      contexto,
      serviceEntidade: services.entidade,
      serviceMutacoes: services.mutacoes,
      evento,
      batch,
      user,
    });

    // Resultado 
    console.log(`${results.entidade.nome} implantado(a).`);
    entidadesKeySet.add(`${tipoEntidadeId}:${results.entidade.id}`);
    commitEvento = true;
  }

  // Finaliza o evento
  if (commitEvento) {
    evento.entidadesKey = Array.from(entidadesKeySet);
    batch.add((b)=>services.eventos.batchUpsert(eventoRef, evento, user, b));
  }

  // Commit final
  await batch.commit();

  console.log(`Implantação de ${tipoEntidadeId}s concluído.`)
  return;
}