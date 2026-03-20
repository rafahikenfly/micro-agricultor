import { criarEfeitosDoEvento, criarEvento, monitorarCanteiro, manejarCanteiro, SOURCE_TYPES } from "micro-agricultor";
import { db } from "../../firebase";
import { canteirosService } from "../crud/canteirosService";
import { historicoEfeitosService } from "../history/efeitosService";
import { eventosService } from "../history/eventosService";

//TODO: levar para shared/types
const tipoEventoMap = {
  resize: {id: "entidadeRedimensionada", nome:"Redimensionamento", categoria: "entidade"},
  create: {id: "entidadeCriada", nome: "Criação", categoria: "entidade"},
  monitor: {id: "monitoramentoManual", nome:"Monitoramento", categoria: "usuário"},
  handle: {id: "manejo", nome: "Manejo", categoria: "usuário"},
  time: { id: "tempoDecorrido", nome: "Tempo Decorrido", categoria: "sistema" }  ,
};

export const salvarCanteiro = async ({
  data,
  user,
  mutation,
  timestamp,
}) => {
  let result;
  if (data.id) {
    result = await canteirosService.update(
      canteirosService.getRefById(data.id),
      data,
      user
    );
  } else {
    result = await canteirosService.create(data, user);
    data.id = result.id;
  }

  if (!mutation) return;
  const id = data.id ?? result?.id
  //TODO: salvar apenas camos relevantes para o tipo de evento
  //ex: resize salva apenas dimensao e posicao
  //ex: edit salva apenas os campos que alteraram
  //ex: monitor salva apenas as caracteristicas que mudaram
  //ex: create não salva before nem efeitos
  const evento = criarEvento({
    tipoEvento: tipoEventoMap[mutation.actionType],
    timestamp: timestamp ?? Date.now(),
    origem: {id: user.uid, tipo: SOURCE_TYPES.USER},
    alvos: [id],
    efeitos: [
      { entidadeId: id,
        tipoEntidadeId: "canteiro",
        before: mutation.before,
        after: mutation.after,
      }
    ]
  })
  const eventoRef = await eventosService.append(evento, user)
  const efeitos = criarEfeitosDoEvento({ ...evento, eventoId: eventoRef.id,})
  if (!efeitos.length) return;

  const batch = db.batch()
  for (const efeito of efeitos) { historicoEfeitosService.batchAppend(efeito, user, batch) }
  await batch.commit()
};

export const monitorarMultiplosCanteiros = async ({
  canteiros,
  medidas,
  user,
  actionType,
  timestamp,
}) => {
  if (!canteiros?.length) return;

  const tipoEvento = tipoEventoMap[actionType];
  const eventoRef = eventosService.getAppendRef();
  const eventoId = eventoRef.id;
  const evento = criarEvento({
    tipoEvento,
    timestamp: timestamp ?? Date.now(),
    origem: {id: user.uid, tipo: SOURCE_TYPES.USER},
    alvos: [],
    efeitos: [],
  })
  evento.id = eventoId;
  
  const batch = db.batch();
  let opCount = 0;

  // processa cada canteiro da seleção
  for (const canteiro of canteiros) {

    // aplica regra de dominio
    const canteiroMonitorado = monitorarCanteiro({
      canteiro,
      medidas,
      eventoId,
      timestamp: timestamp ?? Date.now(),
    });

    // adiciona alvo e efeitos
    // TODO: salvar apenas o que interessa no monitoramento
    evento.alvos.push(canteiro.id)
    evento.efeitos.push({
      entidadeId: canteiro.id,
      tipoEntidadeId: "canteiro",
      before: canteiro,
      after: canteiroMonitorado,
    })

    // adiciona update do canteiro no batch
    const ref = canteirosService.getRefById(canteiro.id);
    canteirosService.batchUpdate(ref, canteiroMonitorado, user, batch);
    opCount++;
  }

  // gera efeitos históricos
  const efeitos = criarEfeitosDoEvento(evento);
  for (const efeito of efeitos) {
    historicoEfeitosService.batchAppend(efeito, user, batch);
    opCount++;
  }

  // inclui o evento no batch
  eventosService.batchUpsert(eventoRef, evento, user, batch);
  opCount++;

  await batch.commit();
};

//TODO: arrumar essa função mais genérica
// passar actionType, timestamp, canteiros, funcao da regra, origem do evento
// para uma regra generica, user só é usado quando tipoEvento.categoria === "usuário"
export const manejarMultiplosCanteiros = async ({
  canteiros,
  manejo,
  user,
  actionType,
  timestamp = Date.now(),
}) => {
  if (!canteiros?.length) return;

  const tipoEvento = tipoEventoMap[actionType];
  const eventoRef = eventosService.getAppendRef();
  const eventoId = eventoRef.id;
  const evento = criarEvento({
    tipoEvento,
    timestamp,
    origem: {id: user.uid, tipo: SOURCE_TYPES.USER},
    alvos: [],
    efeitos: [],
  })
  evento.id = eventoId;
  
  const batch = db.batch();
  let opCount = 0;

  // processa cada canteiro da seleção
  for (const canteiro of canteiros) {

    // aplica regra de dominio
    const canteiroMonitorado = manejarCanteiro({
      canteiro,
      manejo,
      eventoId,
      timestamp
    })

    // adiciona alvo e efeitos
    // TODO: salvar apenas o que interessa no monitoramento
    evento.alvos.push(canteiro.id)
    evento.efeitos.push({
      entidadeId: canteiro.id,
      tipoEntidadeId: "canteiro",
      before: canteiro,
      after: canteiroMonitorado,
    })

    // adiciona update do canteiro no batch
    const ref = canteirosService.getRefById(canteiro.id);
    canteirosService.batchUpdate(ref, canteiroMonitorado, user, batch);
    opCount++;
  }

  // gera efeitos históricos
  const efeitos = criarEfeitosDoEvento(evento);
  for (const efeito of efeitos) {
    historicoEfeitosService.batchAppend(efeito, user, batch);
    opCount++;
  }

  // inclui o evento no batch
  eventosService.batchUpsert(eventoRef, evento, user, batch);
  opCount++;

  await batch.commit();
};