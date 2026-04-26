import { ENTIDADE, EVENTO, ORIGEM } from "../../types/index.js";
import { criarEvento } from "../../domain/evento.rules.js";
import { movimentarPlanta } from "../../domain/planta.rules.js";
import { movimentarCanteiro } from "../../domain/canteiro.rules.js";
import { aplicarRegraPorBatch } from "../batch.js";

const mapTipoEntidadeRegra = {
  [ENTIDADE.planta.id]: movimentarPlanta,
  [ENTIDADE.canteiro.id]: movimentarCanteiro,
}

const THRESHOLD = 2; //cm
function foiMovido(startMap, currentMap) {
  const dx = currentMap.x - startMap.x;
  const dy = currentMap.y - startMap.y;

  return Math.abs(dx) > THRESHOLD || Math.abs(dy) > THRESHOLD;
}

/**
 * Movimenta múltiplas entidades atualizando sua posição.
 *
 * @param {Object} args
 * @param {string} args.tipoEntidadeId
 * @param {Array<Object>} args.entidades
 * @param {Object<string, {x:number,y:number,z?:number}>} args.posicoes
 *   {
 *     [entidadeId]: {x, y, z}
 *   }
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
export async function movimentar({
  tipoEntidadeId,
  entidades,
  posicoes,
  services,
  user,
  timestamp
}) {

  // ======
  // Validações
  // ======
  if (!entidades?.length) {
    throw new Error("Nenhuma entidade para movimentação.");
  }
  if (!tipoEntidadeId) {
    throw new Error("Tipo de entidade não informado.");
  }
  const regra = mapTipoEntidadeRegra[tipoEntidadeId];
  if (!regra) {
    throw new Error(`Nenhuma regra de movimentação para tipo ${tipoEntidadeId}`);
  }
  console.log(`Movimentando ${entidades.length} ${tipoEntidadeId}(s)...`);

  if (!user) user = { uid: "movimentar", nome: ORIGEM.FRONTEND.id };
  if (!timestamp) timestamp = Date.now();

  // ======
  // Evento
  // ======
  const eventoRef = services.eventos.getAppendRef();
  const eventoId = eventoRef.id;

  const evento = criarEvento({
    tipoEvento: EVENTO.MOVIMENTACAO,
    timestamp,
    origem: { id: "movimentar", tipo: ORIGEM.FRONTEND.id },
    entidadesKey: [],
  });
  evento.id = eventoId;
  const entidadesKeySet = new Set();
  let commitEvento = false;
  let batch = services.batch.create();

  // Processa cada entidade do array
  for (const entidade of entidades) {
    await batch.commitIfNeeded();

    const posicaoAntes = entidade.posicao ?? {x: 0, y: 0, z: 0};

    // Monta contexto da regra de movimentacao
    // (argumento posicao é um objeto = {[entidade.id]: {x, y, z} )
    const novaPosicao = posicoes[entidade.id];
    // Sem nova posição ou sem mudança significativa → ignora
    if (!novaPosicao) continue;
    if (!foiMovido(posicaoAntes,novaPosicao)) continue;

    const contexto = {
      posicao: novaPosicao
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
      console.log(`Movimentação de ${entidade.nome} (${entidade.id}) sem mutações`);
      continue;
    }
    // Resultado com mutações
    console.log(`${entidade.nome} (${entidade.id}) movimentado(a).`);
    entidadesKeySet.add(`${tipoEntidadeId}:${entidade.id}`);
    commitEvento = true;
  }

  // Finaliza o evento
  if (commitEvento) {
    evento.entidadesKey = Array.from(entidadesKeySet);
    batch.add((b)=>services.eventos.batchUpsert(eventoRef, evento, user, b));
  }

  // Commit final
  await batch.commit();

  console.log("Movimentação de entidades concluído.")
  return;
}