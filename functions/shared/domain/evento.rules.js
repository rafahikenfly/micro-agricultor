//FUNCTIONS COPY
import { mergeComValidacao } from "./rulesUtils.js";

const eventoPadrao = {
  tipoEventoId: "",   // ex: "chuva", "vasoMovido", "irrigacaoManual"
  tipoEventoNome: "", // denormalização consciente
  categoria: "",      // "natural" | "humano" | "sistema" | "estrutural"
  timestamp: 0,       // quando o fato ocorreu no mundo
  entidadesId: [],    // string[]
  mutacoes: [],       // {entidadeId, tipoEntidadeId, before, after}
}

/**
 * Protege contra problemas no objeto.
 * @param {*} dataObj 
 * @returns 
 */
export const validarObjetoEvento = (dataObj = {}) => {
  // TODO: validações do objeto (tipos, etc..)
  const valid = mergeComValidacao(eventoPadrao, dataObj);
  return valid;
}

export const criarEvento = ({tipoEvento, timestamp, entidadesId, mutacoes, data = {}}) => {
  if (!tipoEvento) throw new Error ("Erro criando evento: tipoEvento é obrigatório.")
  if (!entidadesId) console.warn ("Criando evento sem alvos.")
  if (!mutacoes) console.warn ("Criando evento sem mutações.")

  const novoEvento = {
    ...data,
    tipoEventoId: tipoEvento.id,
    tipoEventoNome: tipoEvento.nome,
    categoria: tipoEvento.categoria,
    timestamp,
    entidadesId,
    mutacoes,
  }

  return validarObjetoEvento(novoEvento)
}

export const criarEfeitosDoEvento = ({evento}) =>{
  if (!evento) throw new Error ("Erro criando efeitos do evento: evento é obrigatório.")
  if (!evento.id) throw new Error ("Erro criando efeitos do evento: evento recebido sem id.")

  const ESTADO_PADRAO = {confianca: 0, valor:0}
  const efeitosDoEvento = [];

  // para cada mutacao
  for (const mutacao of Object.values(evento.mutacoes)) {
    const estadoAntes = mutacao?.before ?? {}
    const estadoDepois = mutacao?.after ?? {}
    const todasCaracteristicas = new Set([
      ...Object.keys(estadoAntes),
      ...Object.keys(estadoDepois),
    ]);
    // para cada caracteristicaId
    for (const caracteristicaId of todasCaracteristicas) {
      const antes = estadoAntes[caracteristicaId] ?? ESTADO_PADRAO;
      const depois = estadoDepois[caracteristicaId] ?? ESTADO_PADRAO;
      
      const mudou =
      antes.confianca !== depois.confianca ||
      antes.valor !== depois.valor;
      
      if (!mudou) continue;

      efeitosDoEvento.push({
        eventoId: evento.id,
        tipoEventoId: evento.tipoEventoId,
        caracteristicaId: caracteristicaId,
        confiancaAntes: antes.confianca ?? 0,
        confiancaDepois: depois.confianca ?? 0,
        valorAntes: antes.valor ?? 0,
        valorDepois: depois.valor ?? 0,
        entidadeId: mutacao.entidadeId,
        tipoEntidadeId: mutacao.tipoEntidadeId,
        timestamp: evento.timestamp,
      });
    }
  }

  return efeitosDoEvento;
}


export const montarEfeitoHistorico = ({eventoId, tipoEventoId, entidadeId, entidadeTipoId, caracteristicaId, estadoAntes, estadoDepois, createdAt, data = {}}) => {
  if (!eventoId) throw new Error ("Erro montando lista de efeitos: eventoId obrigatório.")
  if (!tipoEventoId) throw new Error ("Erro montando lista de efeitos: tipoEventoId obrigatório.")
  if (!entidadeId) throw new Error ("Erro montando lista de efeitos: entidadeId obrigatório.")
  if (!entidadeTipoId) throw new Error ("Erro montando lista de efeitos: entidadeTipoId obrigatório.")
  if (!caracteristicaId) throw new Error ("Erro montando lista de efeitos: caracteristicaId obrigatório.")
  if (!estadoAntes) throw new Error ("Erro montando lista de efeitos: estadoAntes obrigatório.")
  if (!estadoDepois) throw new Error ("Erro montando lista de efeitos: estadoDepois obrigatório.")
  if (!createdAt) throw new Error ("Erro montando lista de efeitos: createdAt obrigatório.")

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

export const calcularEfeitosDoEvento = ({entidadeId, eventoId, tipoEventoId, estadoAntes, estadoDepois, tipoEntidadeId, createdAt}) => {
  if (!entidadeId) throw new Error ("Erro calculando efeitos do evento: entidadeId obrigatório.")
  if (!eventoId) throw new Error ("Erro calculando efeitos do evento: eventoId obrigatório.")
  if (!tipoEventoId) throw new Error ("Erro calculando efeitos do evento: eventoId obrigatório.")
  if (!estadoAntes) throw new Error ("Erro calculando efeitos do evento: estadoAntes obrigatório.")
  if (!estadoDepois) throw new Error ("Erro calculando efeitos do evento: estadoDepois obrigatório.")
  if (!tipoEntidadeId) throw new Error ("Erro calculando efeitos do evento: tipoEntidadeId obrigatório.")
  if (!createdAt) throw new Error ("Erro calculando efeitos do evento: createdAt obrigatório.")
  
    
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
        timestamp: createdAt,
    }));
  }
  return efeitosDoEvento;
}