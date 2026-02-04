export const montarLogEvento = ({tipoEventoId, alvos, origemId, origemTipo, data = {}}) => {
  if (!tipoEventoId) throw new Error ("Erro montando log: tipoEventoId obrigatório.")
  if (!alvos) throw new Error ("Erro montando log: entidadeId obrigatório.")
  if (!origemId) throw new Error ("Erro montando log: origemId obrigatório.")
  if (!origemTipo) throw new Error ("Erro montando log: origemTipo obrigatório.")

  return {
    ...data,
    tipoEventoId,
    alvos,
    origemId,
    origemTipo,
  }
}

export const montarEfeitoHistorico = ({eventoId, tipoEventoId, entidadeId, entidadeTipoId, caracteristicaId, estadoAntes, estadoDepois, createdAt = null, data = {}}) => {
  if (!eventoId) throw new Error ("Erro montando lista de efeitos: eventoId obrigatório.")
  if (!tipoEventoId) throw new Error ("Erro montando lista de efeitos: tipoEventoId obrigatório.")
  if (!entidadeId) throw new Error ("Erro montando lista de efeitos: entidadeId obrigatório.")
  if (!entidadeTipoId) throw new Error ("Erro montando lista de efeitos: entidadeTipoId obrigatório.")
  if (!caracteristicaId) throw new Error ("Erro montando lista de efeitos: caracteristicaId obrigatório.")
  if (!estadoAntes) throw new Error ("Erro montando lista de efeitos: estadoAntes obrigatório.")
  if (!estadoDepois) throw new Error ("Erro montando lista de efeitos: estadoDepois obrigatório.")

    return {
    ...data,
    tipoEventoId,
    caracteristicaId,
    confiancaAntes: estadoAntes?.confianca ?? 0,
    confiancaDepois: estadoDepois?.confianca ?? 0,
    valorAntes: estadoAntes?.valor ?? 0,
    valorDepois: estadoDepois.valor ?? 0,
    entidadeId,
    entidadeTipoId,
    eventoId,
    createdAt,
  }
}

export const calcularEfeitosDoEvento = ({entidadeId, eventoId, tipoEventoId, estadoAntes, estadoDepois, tipoEntidadeId}) => {
  if (!entidadeId) throw new Error ("Erro calculando efeitos do evento: entidadeId obrigatório.")
  if (!eventoId) throw new Error ("Erro calculando efeitos do evento: eventoId obrigatório.")
  if (!tipoEventoId) throw new Error ("Erro calculando efeitos do evento: eventoId obrigatório.")
  if (!estadoAntes) throw new Error ("Erro calculando efeitos do evento: estadoAntes obrigatório.")
  if (!estadoDepois) throw new Error ("Erro calculando efeitos do evento: estadoDepois obrigatório.")
  if (!tipoEntidadeId) throw new Error ("Erro calculando efeitos do evento: tipoEntidadeId obrigatório.")

  const efeitosDoEvento = [];
  for (const caracteristicaId of Object.keys(estadoDepois)) {
    // Se há diferença, adiciona ao rol de efeitos do evento
    const antes = estadoAntes?.[caracteristicaId] ?? {confianca: 0, valor: 0};
    const depois = estadoDepois?.[caracteristicaId] ?? {confianca: 0, valor: 0};
    if (antes.confianca !== depois.confianca || antes.valor !== depois.valor)
      efeitosDoEvento.push(montarEfeitoHistorico({
        eventoId: eventoId,
        tipoEventoId: tipoEventoId,
        entidadeId: entidadeId,
        entidadeTipoId: tipoEntidadeId,
        caracteristicaId: caracteristicaId,
        estadoAntes: antes,
        estadoDepois: depois,
    }));
  }
  return efeitosDoEvento;
}