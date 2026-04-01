//import { db } from "../../../apps/frontend/src/firebase"; //TODO: TEM QUE SAIR ESSE DB DAQUI
import { manejarCanteiro, monitorarCanteiro } from "../domain/canteiro.rules.js";
import { criarEfeitosDoEvento, criarEvento } from "../domain/evento.rules.js";
import { atenderNecessidade, getNecessidadeKey } from "../domain/necessidade.rules.js";
import { manejarPlanta, monitorarPlanta } from "../domain/planta.rules.js";
import { ENTITY_TYPES } from "../types/ENTITY_TYPES.js";
import { EVENTO, EVENTO_TYPES } from "../types/EVENTO.js";
import { ORIGEM_TYPES } from "../types/ORIGEM.js";

/**
 * Aplica manejo em múltiplas entidades
 * @param {Object} params
 * @param {ENTITY_TYPES} params.tipoEntidadeId 
 * @param {uid, USER_TYPES} params.user 
 * @param {number} params.timestamp
 * @param {Array}  params.entidades 
 * @param {Object} params.intervencoes {entidadeId: {entradas: [entradas]}}
 * @param {Object} params.services {eventos, entidade, historicoEfeitos}
 */
export async function processarManejo({
  tipoEntidadeId,         // ENTIDADE_TYPES
  user,                   // {uid: string, tipo: USER_TYPES}
  timestamp,              // integer
  entidades,              // object[]
  intervencoes,           // {entidadeId: {manejoId}: [entradas]}
  services,               // {eventos, entidade, historicoEfeitos, necessidades}
  manejo                  // manejo a ser aplicado
}) {
  if (!entidades?.length) {
    console.warn(`Nenhuma entidade para processar manejo.`)
    return
  };

  // Prepara o evento de manejo
  const tipoEvento = EVENTO[EVENTO_TYPES.HANDLE];  //pega do map, não apenas o id
  const eventoRef = services.eventos.getAppendRef();
  const eventoId = eventoRef.id;
  const evento = criarEvento({
    tipoEvento,
    timestamp,
    entidadesId: [],
    mutacoes: [],
    batch,
  })
  evento.id = eventoId;
  
  // Prepara o batch
  const MAX_OPS = 450;
//  let batch = db.batch(); //TODO: acessar via service
  let opCount = 0;
  const commitIfNeeded = async () => {
    if (opCount >= MAX_OPS) {
      await batch.commit();
//      batch = db.batch();
      opCount = 0;
    }
  };  

  // Processa cada entidade do array
  for (const entidade of entidades) {
    let entidadeManejada = {}
    let before = {}
    let after = {}
    
    // Extrai intervencoes da entidade (medidas é um objeto = {[entidade.id]: {[caracteristicaId]: {}}} )
    const intervencoesEntidade = intervencoes[entidade.id] ?? [];
    
    // Aplica regra de dominio de monitoramento adequada
    // Não uso map de regras aqui e sim o switch porque os argumentos das funções não é padronizado.
    // TODO: Avaliar se não dá para padronizar. O retorno das funções já está padronizado.
    switch (tipoEntidadeId) {
      case ENTITY_TYPES.CANTEIRO:
        ({ entidadeManejada, before, after } = manejarCanteiro({
          canteiro: entidade,
          manejo,
//          entradas: entidade, //TODO: CONSIDERAR AS ENTRADAS DO MANEJO
          eventoId,
          timestamp,
        }));
        break;
      case ENTITY_TYPES.PLANTA: 
        ({ entidadeManejada, before, after } = manejarPlanta({ //TODO: Arrumar o monitoramento de planta
          planta: entidade,
          intervencoes: intervencoesEntidade,
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

    // O manejo tem que atualizar as necessidades de características
    // afetadas (entidadeId_caracteristicaId_handle) a partir do after
    // e também as necessidades de manejo (entidadeId_manejoId_handle)
    // a lista de necessidades inclui todos esses casos.
    const listaNecessidades = [ ...Object.keys(after), manejo.id]
    for (const caracteristicaId of listaNecessidades) {
      // Recupera a necessidade
      const necessidadeId = getNecessidadeKey({
        entidadeId: entidade.id,
        caracteristicaId,
        tipoEventoId: tipoEvento.id
      });
      const necessidade = necessidadesMap[necessidadeId];

      // Atualiza a necessidade
      const necessidadeAtualizada = atenderNecessidade({
        necessidade,
        agente: {uid: user.uid, tipo: ORIGEM_TYPES.USER},
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
    services.entidade.batchUpdate(ref, entidadeManejada, user, batch);
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