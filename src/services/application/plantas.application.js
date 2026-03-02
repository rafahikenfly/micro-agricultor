import { criarEfeitosDoEvento, criarEvento } from "@domain/evento.rules";
import { monitorarPlanta } from "@domain/planta.rules";
import { SOURCE_TYPES } from "../../../shared/types/SOURCE_TYPES";
import { db } from "../../firebase";
import { plantasService } from "../crud/plantasService";
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

export const salvarPlanta = async ({
  data,
  user,
  mutation,
  timestamp,
}) => {
  let result;
  if (data.id) {
    result = await plantasService.update(
      plantasService.getRefById(data.id),
      data,
      user
    );
  } else {
    result = await plantasService.create(data, user);
  }

  if (!mutation) return;
  const id = data.id ?? result?.id
  //TODO: salvar apenas camos relevantes para o tipo de evento
  //ex: resize salva apenas dimensao e posicao
  //monitoramento/manejo apenas as caracteristicas que mudaram
  const evento = criarEvento({
    tipoEvento: tipoEventoMap[mutation.actionType],
    timestamp: timestamp ?? Date.now(),
    origem: {id: user.uid, tipo: SOURCE_TYPES.USER},
    alvos: [id],
    efeitos: [
      { entidadeId: id,
        tipoEntidadeId: "planta",
        before: mutation.before,
        after: mutation.after,
      }
    ]
  })
  const eventoRef = await eventosService.append(evento, user) //TODO: incluir no batch
  evento.id = eventoRef.id
  const efeitos = criarEfeitosDoEvento({evento})
  console.log("ef", efeitos)
  if (!efeitos.length) return;

  const batch = db.batch()
  for (const efeito of efeitos) { historicoEfeitosService.batchAppend(efeito, user, batch) }
  await batch.commit()

};

export const monitorarMultiplasPlantas = async ({
  plantas,
  medidas,
  user,
  actionType,
  timestamp,
}) => {
  if (!plantas?.length) return;

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

  // processa cada planta da seleção
  for (const planta of plantas) {
    // aplica regra de dominio
    const plantaMonitorada = monitorarPlanta({
      planta,
      medidas,
      eventoId,
      timestamp: timestamp ?? Date.now(),
    });

    // adiciona alvo e efeitos
    // TODO: salvar apenas o que interessa no monitoramento
    evento.alvos.push(planta.id)
    evento.efeitos.push({
      entidadeId: planta.id,
      tipoEntidadeId: "planta",
      before: planta,
      after: plantaMonitorada,
    })

    // adiciona update do canteiro no batch
    const ref = plantasService.getRefById(planta.id);
    plantasService.batchUpdate(ref, plantaMonitorada, user, batch);
    opCount++;
  }

  // gera efeitos históricos
  const efeitos = criarEfeitosDoEvento({evento});
  for (const efeito of efeitos) {
    historicoEfeitosService.batchAppend(efeito, user, batch);
    opCount++;

  }

  // inclui o evento no batch
  eventosService.batchUpsert(eventoRef, evento, user, batch);
  opCount++;

  await batch.commit();
};