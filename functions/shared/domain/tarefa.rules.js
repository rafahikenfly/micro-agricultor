//FUNCTION COPY
import { JOBSTATE_TYPES } from "../types/JOBRUN_STATE";
import { RECURRING_TYPES } from "../types/RECURRING_TYPES";
import { mergeComValidacao } from "./rulesUtils";

const aparenciaPadrao = {
    fundo: "#f56f42",
    borda: "#f54242",
    espessura: 1,
    geometria: "circle",
    vertices: [],
};


const tarefaPadrao = {
  //dados
  nome: "Nova Tarefa",
  descrição: "",
  aparencia: aparenciaPadrao,
  estado: JOBSTATE_TYPES.PENDING,     // default seguro
  recorrencia: RECURRING_TYPES.NONE,  // default seguro
  fingerprint: "",

  //contexto
  contexto: {
    tipoEntidadeId: "", // ENTITY_TYPES
    alvos: [],      // string [ entidadeId ]
    caracteristicaId: "",
    motivo: "",
//    confiancaAtual: 0,
//    valorAtual: 0,
  },


  //planejamento
  planejamento: {
    prioridade: 0,
    vencimento: 0,
    recomendacao: "", // EVENTO_TYPES
  },

  //resolucao
  resolucao: {
  //  tipo: RESOLVE_TYPES,
  //  data: integer timestamp,
  //  agente: {
  //      tipo: SOURCE_TYPES.USER,
  //        id: string,  
  }
}

export const validarTarefa = (dataObj = {}) => {
    const valid = mergeComValidacao(tarefaPadrao, dataObj);
    return valid;
}

export const criarTarefa = ({ contexto, planejamento, resolucao, dados}) => {
  const novaTarefa = {
    ...tarefaPadrao,
    contexto: contexto ?? tarefaPadrao.contexto,
    planejamento: planejamento ?? tarefaPadrao.planejamento,
    resolucao: resolucao ?? tarefaPadrao.resolucao,
    ...dados,
  };
  return novaTarefa;
}

export const resolverTarefa = ({tarefa, resolucao}) => {
  switch (tarefa.recorrencia) {
    case RECURRING_TYPES.NONE:
      const tarefaConcluida = {
        ...tarefa,
        estado: JOBSTATE_TYPES.DONE,
        resolucao,
      }

      return tarefaConcluida
    default:
      throw new Error(`Recorrência ${tarefa.recorrencia} não programada.`);
  }
}