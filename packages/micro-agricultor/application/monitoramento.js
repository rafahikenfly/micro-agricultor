import { db } from "../../../apps/frontend/src/firebase"; //TODO: TEM QUE SAIR ESSE DB DAQUI
import { monitorarCanteiro } from "../domain/canteiro.rules";
import { criarEfeitosDoEvento, criarEvento } from "../domain/evento.rules";
import { atenderNecessidade, getNecessidadeId } from "../domain/necessidade.rules";
import { monitorarPlanta } from "../domain/planta.rules";
import { ENTITY_TYPES } from "../types/ENTITY_TYPES";
import { EVENTO, EVENTO_TYPES } from "../types/EVENTO_TYPES";
import { SOURCE_TYPES } from "../types/SOURCE_TYPES";

/**
 * Aplica monitoramento em múltiplas entidades de múltiplas caracteristicas
 * @param {Object} params
 * @param {ENTITY_TYPES} params.tipoEntidadeId 
 * @param {User} params.user 
 * @param {number} params.timestamp
 * @param {Array}  params.entidades 
 * @param {Object} params.medidas {{entidadeId: {caracteristicaId: {valor, confianca}}}}
 * @param {Object} params.services {eventos, entidade, historicoEfeitos}
 */
export async function processarMonitoramento({
  tipoEntidadeId,         // ENTIDADE_TYPES
  user,                   // Object user
  timestamp,              // integer
  entidades,              // object[]
  medidas,                // {{entidadeId: {caracteristicaId: {valor, confianca}}}}
  services                // {eventos, entidade, historicoEfeitos, necessidades}
}) {
  if (!entidades?.length) {
    console.warn(`Nenhuma entidade para processar monitoramento.`)
    return
  };

  // Prepara o evento de monitoramento
  const tipoEvento = EVENTO[EVENTO_TYPES.MONITOR];  //pega do map, não apenas o id
  const eventoRef = services.eventos.getAppendRef();
  const eventoId = eventoRef.id;
  const evento = criarEvento({
    tipoEvento,
    timestamp,
    entidadesId: [],
    mutacoes: [],
  })
  evento.id = eventoId;
  
  // Prepara o batch
  const MAX_OPS = 450;
  let batch = db.batch(); //TODO: acessar via service
  let opCount = 0;
  const commitIfNeeded = async () => {
    if (opCount >= MAX_OPS) {
      await batch.commit();
      batch = db.batch();
      opCount = 0;
    }
  };  

  // Processa cada entidade do array
  for (const entidade of entidades) {
    let entidadeMonitorada = {}
    let before = {}
    let after = {}
    
    // Extrai medidas da entidade (medidas é um objeto = {[entidade.id]: {[caracteristicaId]: {}}} )
    const medidasEntidade = medidas[entidade.id];
    if (!medidasEntidade) continue;
    
    // Aplica regra de dominio de monitoramento adequada
    // Não uso map de regras aqui e sim o switch porque os argumentos das funções não é padronizado.
    // TODO: Avaliar se não dá para padronizar. O retorno das funções já está padronizado.
    switch (tipoEntidadeId) {
      case ENTITY_TYPES.CANTEIRO:
        ({ entidadeMonitorada, before, after } = monitorarCanteiro({
          canteiro: entidade,
          medidas: medidasEntidade,
          eventoId,
          timestamp,
        }));
        break;
      case ENTITY_TYPES.PLANTA: 
        ({ entidadeMonitorada, before, after } = monitorarPlanta({
          planta: entidade,
          medidas: medidasEntidade,
          eventoId,
          timestamp,
        }));
        break;
      default:
        throw new Error (`Entidade ${tipoEntidadeId} não é monitorável.`)
    }


    // Atualiza a necessidade de monitoramento de cada característica da entidade
    // TODO: para melhorar a performance, é possível recuperar até 10 ids com a
    // mesma consulta usando o getByEntidadesArray do mesmo service. Tem que ver as
    // implicações no resto da função.
    const necessidades = await services.necessidades.getByEntidade(entidade.id);
    const necessidadesMap = Object.fromEntries(
      necessidades.map(n => [n.id, n])
    );
    for (const caracteristicaId of Object.keys(medidasEntidade)) {
      // Recupera a necessidade
      const necessidadeId = getNecessidadeId({
        entidadeId: entidade.id,
        caracteristicaId,
        tipoEventoId: tipoEvento.id
      });
      const necessidade = necessidadesMap[necessidadeId];

      // Atualiza a necessidade
      const necessidadeAtualizada = atenderNecessidade({
        necessidade,
        agente: {uid: user.uid, tipo: SOURCE_TYPES.USER},
        timestamp
      });

      // Inclui no batch se houver atualização
      if (necessidadeAtualizada) {
        const necessidadeRef = services.necessidades.getRefById(necessidadeId);
        services.necessidades.batchUpsert(necessidadeRef, necessidadeAtualizada, user, batch);
        opCount++;
        await commitIfNeeded();
      }
    }

    // Vai adicionando id da entidade e mutações ao evento...
    // Monitoramento sempre muda o estado atual, mesmo que não mude o valor
    // pois vai alterar as chaves de histórico do estado (manejos e eventos relacionados)
    evento.entidadesId.push(entidade.id)
    evento.mutacoes.push({
      entidadeId: entidade.id,
      tipoEntidadeId,
      before,
      after,
    })

    // Adiciona o update da entidade no batch
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