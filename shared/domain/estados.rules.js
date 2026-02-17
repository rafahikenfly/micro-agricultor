 //TODO: ESSE ARQUIVO PRECISA SER RENOMEADO PARA tables.rules.js

import { mergeComValidacao } from "./rulesUtils";

const estadoPadrao = {
    nome: "Novo Estado",
    descricao: "",
    tagVariant: "dark",
};

const estagioPadrao = {
    nome: "Novo Estágio",
    descricao: "",
    tagVariant: "dark",
};

const categoriaPadrao = {
    nome: "Novo Estágio",
    descricao: "",
    tagVariant: "dark",
};

const caracteristicaPadrao = {
    nome: "Nova Característica",
    descricao: "",
    unidade: "",
    longevidade: 10,
    resolucao: 100,
    aplicavel: {},
};

export const validarEstado = (dataObj = {}) => {
    const valid = mergeComValidacao(estadoPadrao, dataObj);
    return valid;
}

export const validarEstagio = (dataObj = {}) => {
    const valid = mergeComValidacao(estagioPadrao, dataObj);
    return valid;
}

export const validarCategoria = (dataObj = {}) => {
    const valid = mergeComValidacao(categoriaPadrao, dataObj);
    return valid;
}
export const validarCaracteristica = (dataObj = {}) => {
    const valid = mergeComValidacao(caracteristicaPadrao, dataObj);
    return valid;
}