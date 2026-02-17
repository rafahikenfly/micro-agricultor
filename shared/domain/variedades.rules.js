import { mergeComValidacao } from "./rulesUtils";

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


export const validarVariedade = (dataObj = {}) => {
    const valid = mergeComValidacao(especiePadrao, dataObj);
    return valid;
}

export const alteraEspecieDaVariedade = ({ especie, variedade }) => {
  if (!variedade) throw new Error ("Erro alterando espécie da variedade: variedade obrigatório.")
  if (!(especie.ciclo || []).length === 0) throw new Error ("Erro alterando espécie da variedade: espécie com ciclo vazio.")
  if (!especie) return variedade;

  const cicloVariedade = Array.isArray(especie.ciclo)
    ? especie.ciclo.map(estagio => ({
        estagioId: estagio.estagioId ?? estagio.id ?? null,
        estagioNome: estagio.estagioNome ?? estagio.nome ?? "",
      }))
    : [];

  return {
    ...variedade,
    especieId: especie.id,
    especieNome: especie.nome,
    ciclo: cicloVariedade,
    // cópias diretas da espécie
    aparencia: especie.aparencia ?? aparenciaPadrao,
  };
}