import { ROUTING_POLICIES, MODELO } from "../types/index.js"
import { mergeComValidacao } from "./rulesUtils.js";

export const cvSpecsPadrao = {
  nome: "Novo Trabalho de Visão",
  descricao: "Descrição do trabalho de visão computacional",
  aplicavel: {},

  modelo: {
    modeloId: "",
    modeloVersao: 1,
    especialidadeId: "",
    especialidadeField: "",
    validade: "",
  },
  inferencia: {
    inferenciaTipo: MODELO.COUNTING.id,
    thresholds: {
      high: 1,
      low: 0,
      tolerance: 0,
    },
    timeout: 10,
    markers: {
      homografia: false,
    },
  },
  resultado: {
    estadoId: "",
    estadoNome: "",
    aparencia: {
      espessura: 1,
      borda: "#FF0000",
      fundo: "#DD1111",
      geometria: "circle",
      vertices: [],
    },
  },
  routingPolicy: {
    onHighConfidence: ROUTING_POLICIES[0].id,
    onLowConfidence: ROUTING_POLICIES[0].id,
    onNoDetection: ROUTING_POLICIES[0].id,
    archiveOriginal: true,
    saveAnnotated: true,
    deleteAfterProcessing: false,    
    randomManualRate: 0.02         // 2% para inspeção manual aleatória
  },
  tagVariant: "primary",
  version: 1,
};


export const validarCvSpecs = (dataObj = {}) => {
    const valid = mergeComValidacao(cvSpecsPadrao, dataObj);
    return valid;
}