// TAREFA é um agregador que enriquece o contexto de uma ou mais NECESSIDADES.
// Por definição, tarefa tem um contexto: um motivo, um tipo de entidade,
// um tipo de evento a uma característica, um conjunto de entidades
// Ex: A tarefa é algo como "MONITORAR NÚMERO DE FOLHAS" e pode ter N entidades do tipo PLANTA.
// Cada tarefa tem um planejamento e uma resolução, além de estado.

import { CVRUN_ESTADO } from "../types";
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
  estado: CVRUN_ESTADO.PENDING.id,     // default seguro

  //contexto
  contexto: {
    tipoEntidadeId: "",   // ENTITY_TYPES
    entidadesId: [],      // string [ entidadeId ]
    caracteristicaId: "", // Catalogo Características
    tipoEventoId: "",     // EVENTO_TYPES
  },


  //planejamento
  planejamento: {
    prioridade: 0,
    vencimento: 0,
    recorrencia: RECURRING_TYPES.NONE,  // default seguro
  },

  //resolucao
  resolucao: {
    tipoResolucao: "",
    timestamp: "",
    agente: {
        tipo: "",
          id: "",  
    }
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
  switch (tarefa.planejamento.recorrencia) {
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