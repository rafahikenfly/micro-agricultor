import { JOBRUN_STATE } from "../types/JOBRUN_STATE";
import { mergeComValidacao } from "./rulesUtils";

const cvJobRunPadrao = {
    nome: "Novo CVJob",
    cvJobSpecsId: "",
    cvJobSpecsNome: "",
    estado: JOBRUN_STATE[0].id,
    contexto: {
        entidadeId: "",
        entidadeNome: "",
        tipoEntidadeId: "",
    },
    imagem: {
        path: "",
        origem: "",
        timestamp: "",
    },
    execucao: {
        workerId: "",
        startedAt: "",
        finishedAt: "",
        durationMs: "",
        retries: 0,
    },
    resultados: {
        modeloId: "",
        modeloVersao: "",
        mediaConfianca: "",
        numDeteccoes: "",
        pathResultados: "",
    },
    encaminhamento: {
        decisao: null,
        motivo: null,
        pathEncaminhamento: ""
    }
}


export const validarCvJobRun = (dataObj = {}) => {
    const valid = mergeComValidacao(cvJobRunPadrao, dataObj);
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
    estado: JOBRUN_STATE[0].id,
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