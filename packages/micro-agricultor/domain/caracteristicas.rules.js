import { VARIANTE } from "../types/index.js";
import { mergeComValidacao } from "./rulesUtils.js";

const caracteristicaPadrao = {
    nome: "Nova Característica",
    descricao: "",
    longevidade: 10,
    obsolescencia: {
        ativo: false,
        longevidade: 0,
    },
    variacao: {
        ativo: false,
        valor: 0,
    },
    medida: {
        unidade: "",
        min: 0,
        max: 1024,
    },
    resolucao: {
        x: 100,
        y: 100,
        z: 100,
        valor: 15,
    },
    aplicavel: {},
    acumulacao: {
        tempo: 0,
        tipoAcumulacaoId: "",
        limite: 0,
    },
    variant: VARIANTE.DARKBLUE.variant,
};

export const validarCaracteristica = (dataObj = {}) => {
    const valid = mergeComValidacao(caracteristicaPadrao, dataObj);
    return valid;
};
