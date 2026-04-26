import { mergeComValidacao } from "./rulesUtils.js";

const ModeloCVPadrao = {
    nome: "Novo Modelo",
    descrição: "Novo modelo de visão computacional",
    ativo: true,
    tipoEntidadeId: "",
    especialista: false,
    especialidadeKey: "",
    especialidadeValue: "",
//    trainingPolicy: {
//        minSamples: null,
//        retrainOnExpire: true,
//        expiresAt: null,
//    },
  variant: "primary",
}

export const validarModeloCV = (dataObj = {}) => {
    const valid = mergeComValidacao(ModeloCVPadrao, dataObj);
    return valid;
}
