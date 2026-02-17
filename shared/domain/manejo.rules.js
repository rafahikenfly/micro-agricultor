import { mergeComValidacao } from "./rulesUtils";

const aparenciaPadrao = {
    fundo: "#4CAF50",
    borda: "#1B5E20",
    espessura: 2,
    geometria: "polygon",
    vertices: [],
};
const manejoPadrao = {
  descricao: "",
  nome: "Novo manejo",
  efeitos: [],
  entradas: [],
  aplicavel: [],
  estadoDestinoId: "",
  estadoDestinoNome: "",
  estadoOrigemId: "",
  estadoOrigemNome: "",
  requerEntrada: false,
  temEfeitos: false,
};


export const validarManejo = (dataObj = {}) => {
    const valid = mergeComValidacao(manejoPadrao, dataObj);
    // Se for aplicável a hortas ou a dois tipos de entidade, limpa os estados
    if (valid.aplicavel.length > 1 || valid.aplicavel.horta) {
        valid.estadoDestinoId = "";
        valid.estadoDestinoNome = "";
        valid.estadoOrigemId = "";
        valid.estadoOrigemNome = "";
    }
    return valid;
}