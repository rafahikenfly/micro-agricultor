import { ROUTING_POLICIES } from "../types/ROUTING_POLICIES"
import { MODEL_TYPES } from "../types/MODEL_TYPES"
import { mergeComValidacao } from "./rulesUtils";
import { CV_MODELS } from "../types/CV_MODELS";

export const cvJobSpecsPadrao = {
  nome: "Novo Trabalho de Visão",
  descricao: "Descrição do trabalho de visão computacional",
  aplicavel: {},

  model: {
    modelId: "",
    modelType: MODEL_TYPES[0].id,
    modelVersion: 1,
    thresholds: {
      high: 1,
      low: 0,
      tolerance: 0,
    },
  },
  output: {
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
  timeout: 10,
  markers: {
    homografia: false,
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


export const validarCvJobSpecs = (dataObj = {}) => {
    const valid = mergeComValidacao(cvJobSpecsPadrao, dataObj);
    return valid;
}