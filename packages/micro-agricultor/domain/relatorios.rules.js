import { ESTADO_TAREFA } from "../types";
import { mergeComValidacao } from "./rulesUtils";

const relatorioPadrao = {
  //dados
  nome: "Novo Relatório",
  descrição: "",
  estado: ESTADO_TAREFA.PENDENTE.id,     // default seguro
  contexto: {
    canteirosId: [],
    plantasId: [],
    caracteristicasId: [],
  },
  inicio: 0,
  fim: 0,
}

export const validarRelatorio = (dataObj = {}) => {
    const valid = mergeComValidacao(relatorioPadrao, dataObj);
    return valid;
}


