import { mergeComValidacao } from "../utils/rulesUtils";

const aparenciaPadrao = {
    fundo: "#4CAF50",
    borda: "#1B5E20",
    espessura: 2,
    geometria: "polygon",
    vertices: [{x:0, y:0}, {x:100, y:0}, {x:100, y:100}, {x:0, y:100}],
};
const hortaPadrao = {
  altitude: 0,
  aparencia: aparenciaPadrao,
  orientacao: 0,
  nome: "Nova horta",
  descricao: "",
  posicao: {
    lat: -25.4201517,
    long: -49.2739828,
  },
};


export const validarHorta = (dataObj = {}) => {
    const valid = mergeComValidacao(hortaPadrao, dataObj);
    valid.aparencia.geometria = "polygon" // Toda horta é poligono
    return valid;
}