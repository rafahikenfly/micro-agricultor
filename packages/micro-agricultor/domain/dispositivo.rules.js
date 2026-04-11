import { mergeComValidacao } from "./rulesUtils";

const dispositivoPadrao = {
    nome: "Novo Dispositivo",
    descricao: "",
    tipo: "",
    perifericos: {},
};

export const validarDispositivo = (dataObj = {}) => {
    const valid = mergeComValidacao(dispositivoPadrao, dataObj);
    return valid;
}
