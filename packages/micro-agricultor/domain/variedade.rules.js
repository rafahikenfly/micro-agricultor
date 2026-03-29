import { mergeComValidacao } from "./rulesUtils.js";

const aparenciaPadrao = {
    fundo: "#4CAF50",
    borda: "#1B5E20",
    espessura: 2,
    geometria: "circle",
    vertices: [],
};
const variedadePadrao = {
  aparencia: aparenciaPadrao,
  ciclo: [],
  espacamento: {
    x: 30,
    y: 30,
    z: 0,
  },
  especieId: "",
  especieNome: "",
  nome: "Nova variedade",
  descricao: "",
};

export const validarVariedade = (dataObj = {}) => {
    const valid = mergeComValidacao(variedadePadrao, dataObj);
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

export const getDimensaoVariedade = (variedade) => {
  let maxX = 0, maxY = 0, maxZ = 0;

  for (const estagio of variedade.ciclo) {
    const { x = 0, y = 0, z = 0 } = estagio.dimensao || {};
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    maxZ = Math.max(maxZ, z);
  }

  return { x: maxX, y: maxY, z: maxZ };
}