import { mergeComValidacao } from "./rulesUtils";

const cvModeloPadrao = {
    nome: "Novo Modelo",
    descrição: "Novo modelo de visão computacional",
    trainingPolicy: {
        minSamples: null,
        retrainOnExpire: true,
        expiresAt: null,
    },
  tagVariant: "primary",
}

export const validarCvModelo = (dataObj = {}) => {
    const valid = mergeComValidacao(cvModeloPadrao, dataObj);
    return valid;
}
