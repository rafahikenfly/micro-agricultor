import { db } from "../../src/firebase";
import { monitorarCanteiro } from "../domain/canteiro.rules";
import { criarEfeitosDoEvento, criarEvento } from "../domain/evento.rules";
import { monitorarPlanta } from "../domain/planta.rules";
import { ENTITY_TYPES } from "../types/ENTITY_TYPES";
import { EVENTO, EVENTO_TYPES } from "../types/EVENTO_TYPES";

/**
 * Aplica monitoramento em múltiplas entidades de múltiplas caracteristicas
 * @param {Object} params
 * @param {ENTITY_TYPES} params.tipoEntidadeId 
 * @param {uid, USER_TYPES} params.user 
 * @param {number} params.timestamp
 * @param {Array}  params.entidades 
 * @param {Object} params.medidas {{entidadeId: {caracteristicaId: {valor, confianca}}}}
 * @param {Object} params.services {eventos, entidade, historicoEfeitos}
 */
export async function processarMonitoramento({
  tipoEntidadeId,         // ENTIDADE_TYPES
  user,                   // {uid: string, tipo: USER_TYPES}
  timestamp,              // integer
  entidades,              // object[]
  medidas,                // {{entidadeId: {caracteristicaId: {valor, confianca}}}}
  services                // {eventos, entidade, historicoEfeitos}
}) {
  if (!entidades?.length) return;

  // prepara o evento
  const tipoEvento = EVENTO[EVENTO_TYPES.MONITOR];
  const eventoRef = services.eventos.getAppendRef();
  const eventoId = eventoRef.id;
  const evento = criarEvento({
    tipoEvento,
    timestamp,
    alvos: [],
    efeitos: [],
  })
  evento.id = eventoId;
  
  // prepara o batch
  const MAX_OPS = 450; // margem de segurança
  let batch = db.batch();
  let opCount = 0;
  const commitIfNeeded = async () => {
    if (opCount >= MAX_OPS) {
      await batch.commit();
      batch = db.batch(); //TODO: acessar via service
      opCount = 0;
    }
  };  

  // processa cada entidade do array
  for (const entidade of entidades) {
    let entidadeMonitorada = {}
    let before = {}
    let after = {}
    
    // extrai medidas da entidade
    const medidasEntidade = medidas[entidade.id];
    if (!medidasEntidade) continue;
    
    // aplica regra de dominio
    switch (tipoEntidadeId) {
      case ENTITY_TYPES.CANTEIRO:
        ({ entidadeMonitorada, before, after } = monitorarCanteiro({
          canteiro: entidade,
          medidas: medidas[entidade.id],
          eventoId,
          timestamp,
        }));
        break;
      case ENTITY_TYPES.PLANTA: 
        ({ entidadeMonitorada, before, after } = monitorarPlanta({
          planta: entidade,
          caracteristicasMedidas: medidas[entidade.id],
          eventoId,
          timestamp,
        }));
        break;
      default:
        throw new Error (`Entidade ${tipoEntidadeId} não é monitorável.`)
    }
    // adiciona alvo e efeitos
    evento.alvos.push(entidade.id)
    evento.efeitos.push({
      entidadeId: entidade.id,
      tipoEntidadeId,
      before,
      after,
    })

    // adiciona update da entidade no batch
    const ref = services.entidade.getRefById(entidade.id);
    services.entidade.batchUpdate(ref, entidadeMonitorada, user, batch);
    opCount++;
    await commitIfNeeded();
  }

  // gera efeitos históricos
  const efeitos = criarEfeitosDoEvento({evento});
  for (const efeito of efeitos) {
    services.historicoEfeitos.batchAppend(efeito, user, batch);
    opCount++;
    await commitIfNeeded();
  }

  // inclui o evento no batch
  services.eventos.batchUpsert(eventoRef, evento, user, batch);
  opCount++;

  await batch.commit();
};