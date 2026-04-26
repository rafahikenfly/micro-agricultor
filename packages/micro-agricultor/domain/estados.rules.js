import { VARIANTE } from "../types/VARIANTE.js";
import { mergeComValidacao } from "./rulesUtils.js";

const estadoPadrao = {
    nome: "Novo Estado",
    descricao: "",
    propriedades: {
      visivelNoMapa: true,
      editavelNoMapa: true,
      requerMonitoramento: true,
    },
    variant: VARIANTE.BLACK.variant,
};

const estagioPadrao = {
    nome: "Novo Estágio",
    descricao: "",
    variant: VARIANTE.BLACK.variant,
};

const categoriaPadrao = {
    nome: "Nova Categoria",
    descricao: "",
    variant: VARIANTE.BLACK.variant,
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
