// NECESSIDADE é aquilo que precisa ser feito em algum momento e está vinculado a
// alguma coisa (evento, tarefa...). Ela tem uma chave natural, fica indexado em
// /necessidade/[entidadeId]/[caracteristicaId]/[eventoTipoId]. Ela é a fonte de
// verdade relacionado com a necessidade de se fazer ou não alguma coisa e todas
// as ações que são tomadas estão registradas na chave correspondente.

import { mergeComValidacao } from "./rulesUtils";

const necessidadePadrao = {
  ativo: true,  
  entidadeId: "",
  caracteristicaId: "",
  tipoEventoId: "",
  motivo: "",           // REASON_TYPES
  estadoAtual: {
    valor: null,
    confianca: null,
  },
  atendimento: {
    timestamp: null,
    agente: {
      tipo: null,
      uid: null,
    },
  },
  vinculo: {
    tipo: "",
    id: "",
  }
}

export const validarNecessidade = (dataObj = {}) => {
    const valid = mergeComValidacao(necessidadePadrao, dataObj);
    return valid;
}

export const getNecessidadeId = ({ entidadeId, caracteristicaId, tipoEventoId }) => {
  if (!entidadeId) throw new Error ("getNecessidadeId: entidadeId obrigatório para gerar chave de necessidade");
  if (!caracteristicaId) throw new Error ("getNecessidadeId: caracteristicaId obrigatório para gerar chave de necessidade");
  if (!tipoEventoId) throw new Error ("getNecessidadeId: tipoEventoId obrigatório para gerar chave de necessidade");
  return `${entidadeId}_${caracteristicaId}_${tipoEventoId}`;
}

export function atenderNecessidade({necessidade, agente, timestamp}) {
  if (!necessidade) return null;
  if (!necessidade.ativo) return null;

  return {
    ...necessidade,
    ativo: false,
    atendimento: {
      timestamp,
      agente
    }
  };
}