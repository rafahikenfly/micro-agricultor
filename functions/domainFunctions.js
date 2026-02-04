const { Timestamp } = require("@google-cloud/firestore");


// ========== canteiro.rules ==========
function degradarCaracteristicasCanteiro({canteiro, catalogo, eventoId}) {
  if (!canteiro) throw new Error ("Erro degradando caracteristicas de canteiro: canteiro obrigatório.")
  if (!catalogo) throw new Error ("Erro degradando caracteristicas de canteiro: catalogo obrigatório.")
  if (!eventoId) throw new Error ("Erro degradando caracteristicas de canteiro: eventoId obrigatório.")

  if (!canteiro?.estadoAtual) return null;

  const now = Timestamp.now();
  const novoEstadoAtual = { ...canteiro.estadoAtual };

  for (const caracteristicaId of Object.keys(novoEstadoAtual)) {
    const caracteristica = novoEstadoAtual[caracteristicaId];
    const caracteristicaCatalogo = catalogo.find(
      c => c.id === caracteristicaId
    );

    if (!caracteristica ||
      !caracteristica.calculadoEm ||
      !caracteristicaCatalogo?.longevidade) {
      continue;
    }

    const dtMs = now.toMillis() - caracteristica.calculadoEm.toMillis();
    if (dtMs <= 0) continue;

    const diasDecorridos = dtMs / (1000 * 60 * 60 * 24);
    const k = 100 / caracteristicaCatalogo.longevidade;
    const novaConfianca = caracteristica.confianca - diasDecorridos * k;
    //TODO: degradar valor

    novoEstadoAtual[caracteristicaId] = {
      ...caracteristica,
      confianca: Number(Math.max(0, novaConfianca).toFixed(2)),
      calculadoEm: now,
      eventos: [... caracteristica.eventos, eventoId],
    };
  }

  return {
    ...canteiro,
    estadoAtual: novoEstadoAtual,
  };
}

// ========== eventos.rules ==========
const montarLogEvento = ({tipoEventoId, alvos, origemId, origemTipo, efeitos = {}, createdAt = null, data = {}}) => {
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
      efeitos,
      createdAt,
  }
}

const montarEfeitoHistorico = ({eventoId, tipoEventoId, entidadeId, entidadeTipo, caracteristicaId, estadoAntes, estadoDepois, createdAt = null, data = {}}) => {
  if (!eventoId) throw new Error ("Erro montando lista de efeitos: eventoId obrigatório.")
  if (!tipoEventoId) throw new Error ("Erro montando lista de efeitos: tipoEventoId obrigatório.")
  if (!entidadeId) throw new Error ("Erro montando lista de efeitos: entidadeId obrigatório.")
  if (!entidadeTipo) throw new Error ("Erro montando lista de efeitos: entidadeTipo obrigatório.")
  if (!caracteristicaId) throw new Error ("Erro montando lista de efeitos: caracteristicaId obrigatório.")
  if (!estadoAntes) throw new Error ("Erro montando lista de efeitos: estadoAntes obrigatório.")
  if (!estadoDepois) throw new Error ("Erro montando lista de efeitos: estadoDepois obrigatório.")

    return {
    ...data,
    tipoEventoId,
    caracteristicaId,
    confiancaAntes: estadoAntes?.confianca || 0,
    confiancaDepois: estadoDepois?.confianca || 0,
    valorAntes: estadoAntes?.valor || 0,
    valorDepois: estadoDepois.valor || 0,
    entidadeId,
    entidadeTipo,
    eventoId,
    createdAt,
  }
}

const calcularEfeitosDoEvento = ({entidadeId, eventoId, tipoEventoId, estadoAntes, estadoDepois, tipoEntidade}) => {
  if (!entidadeId) throw new Error ("Erro calculando efeitos do evento: entidadeId obrigatório.")
  if (!eventoId) throw new Error ("Erro calculando efeitos do evento: eventoId obrigatório.")
  if (!tipoEventoId) throw new Error ("Erro calculando efeitos do evento: tipoEventoId obrigatório.")
  if (!estadoAntes) throw new Error ("Erro calculando efeitos do evento: estadoAntes obrigatório.")
  if (!estadoDepois) throw new Error ("Erro calculando efeitos do evento: estadoDepois obrigatório.")
  if (!tipoEntidade) throw new Error ("Erro calculando efeitos do evento: tipoEntidade obrigatório.")

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
        entidadeTipo: tipoEntidade,
        caracteristicaId: caracteristicaId,
        estadoAntes: antes,
        estadoDepois: depois,
    }));
  }
  return efeitosDoEvento;
}

exports.degradarCaracteristicasCanteiro = degradarCaracteristicasCanteiro;
exports.montarLogEvento = montarLogEvento;
exports.montarEfeitoDegradacao = montarEfeitoHistorico;
exports.calcularEfeitosDoEvento = calcularEfeitosDoEvento;