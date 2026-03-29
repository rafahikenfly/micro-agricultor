import { mergeComValidacao } from "./rulesUtils.js";

const aparenciaPadrao = {
    fundo: "#4CAF50",
    borda: "#1B5E20",
    espessura: 2,
    geometria: "circle",
    vertices: [],
};
const especiePadrao = {
  aparencia: aparenciaPadrao,
  categoriaId: "",
  categoriaNome: "",
  ciclo: [],
  nome: "Nova espécie",
  descricao: "",
  nomeCientifico: "",
};


export const validarEspecie = (dataObj = {}) => {
    const valid = mergeComValidacao(especiePadrao, dataObj);
    return valid;
}