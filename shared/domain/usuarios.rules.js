import { mergeComValidacao } from "./rulesUtils";
const acessoPadrao = {
    admin: false,
    dev: false,
    usuario: true,
}
const usuarioPadrao = {
  acesso: acessoPadrao,
  apelido: "",
  contexto: {},
  email: "",
  nome: "Novo usuário",
  descricao: "",
};


export const validarUsuario = (dataObj = {}) => {
    const valid = mergeComValidacao(usuarioPadrao, dataObj);
    return valid;
}