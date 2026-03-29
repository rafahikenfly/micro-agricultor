import { ESTADO_TAREFA } from "../types/index.js";
import { mergeComValidacao } from "./rulesUtils.js";

const cvRunPadrao = {
  midiaId: "",
  midiaPath: "",
  pipeline: {
    versao: "v0.4",
    params: {
      // qualquer parametro necessário
    }
  },
  estado: "",
  resultados: [
    /* {
      step: "generalista_planta",

      modelo: {
        id: "plant-net",
        versao: "v2"
      },

      output: {
        especie: "tomate",
        altura_cm: 45
      },

      metricas: {
        confiancaMedia: 0.87,
        numDeteccoes: 3,
        latenciaMs: 0,
      }
    } */  
  ],
  contexto: {
      entidadeId: "",
      entidadeNome: "",
      tipoEntidadeId: "",
  },
  execucao: {
      workerId: "",
      startedAt: "",
      finishedAt: "",
      durationMs: "",
      retries: 0,
  },
  artefatos: [
    /*{
      tipo: "input" | "segmentacao" | "bbox" | "heatmap",
      step: "especialista_tomate",
      path: "...",
      formato: "png"
    }*/
  ],
  encaminhamento: {
      decisao: null,
      motivo: null,
      pathEncaminhamento: ""
  }
}


export const validarCvJobRun = (dataObj = {}) => {
    const valid = mergeComValidacao(cvRunPadrao, dataObj);
    return valid;
}

export function criarCvJobRunContext(entidade, tipoEntidadeId) {
  if (!entidade) throw new Error("Erro criando cvJobRunContext: entidade é obrigatórios");
  if (!tipoEntidadeId) throw new Error("Erro criando cvJobRunContext: tipoEntidadeId é obrigatórios");

  switch (tipoEntidadeId) {
    case "canteiro":
      return {
        hortaId: entidade.hortaId,
        hortaNome: entidade.hortaNome,
        entidadeId: entidade.id,
        entidadeNome: entidade.nome,
        tipoEntidadeId: "canteiro",
      };

    case "planta":
      return {
        hortaId: entidade.hortaId,
        hortaNome: entidade.hortaNome,
        canteiroId: entidade.canteiroId,
        canteiroNome: entidade.canteiroNome,
        entidadeId: entidade.id,
        entidadeNome: entidade.nome,
        tipoEntidadeId: "planta"
      };

    default:
      throw new Error(`Tipo de entidade inválido: ${tipoEntidadeId}`);
  }
}

export function criarCvJobRun({cvJobRunId, cvJobSpecs, entidade, tipoEntidadeId, origemImagem, timestamp, service}) {
  if (!cvJobSpecs) throw new Error("Erro criando cvJobRun: cvJobSpecs é obrigatórios");
  if (!entidade) throw new Error("Erro criando cvJobRun: entidade é obrigatórios");
  if (!tipoEntidadeId) throw new Error("Erro criando cvJobRun: tipoEntidadeId é obrigatórios");
  if (!origemImagem) throw new Error("Erro criando cvJobRun: origemImagem é obrigatórios");
  if (!timestamp) throw new Error("Erro criando cvJobRun: timestamp é obrigatórios");
  if (!cvJobRunId) throw new Error("Erro criando cvJobRun: cvJobRunId é obrigatórios");

  const cvJobRun = {
    nome: "Novo CVJob",
    cvJobSpecsId: cvJobSpecs.id,
    cvJobSpecsNome: cvJobSpecs.nome,
    estado: ESTADO_TAREFA.PENDING.id,
    contexto: criarCvJobRunContext(entidade, tipoEntidadeId),
    imagem: {
        bucket: `micro-agricultor.firebasestorage.app`,
        path: `cvJobRuns/jobRun_${cvJobRunId}_jobSpecs${cvJobSpecs.id}.jpg`,
        origem: origemImagem,
        timestamp: timestamp,
    },
    execucao: {
      retries: 0,
    },
    resultados: {
      modeloId: cvJobSpecs.model.modelId,
      modeloVersao: cvJobSpecs.model.modelVersion,
    },
    encaminhamento: {}
  }
  return cvJobRun
}