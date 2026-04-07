import { mergeComValidacao } from "./rulesUtils.js";

const eventoPadrao = {
  tipoEventoId: "",   // EVENTO[TYPE].id
  tipoEventoNome: "", // denormalização consciente
  timestamp: 0,       // quando o fato ocorreu no mundo
  entidadesKey: [],   // string[]
}

/**
 * Protege contra problemas no objeto.
 * @param {*} dataObj 
 * @returns 
 */
export const validarObjetoEvento = (dataObj = {}) => {
  // TODO: validações do objeto (tipos, etc..)
  const valid = mergeComValidacao(eventoPadrao, dataObj);
  return valid;
}

export const criarEvento = ({tipoEvento, timestamp, origem, entidadesKey, data = {}}) => {
  if (!tipoEvento) throw new Error ("Erro criando evento: tipoEvento é obrigatório.")
  if (!tipoEvento) throw new Error ("Erro criando evento: origem {id, tipo} é obrigatória.")
  if (!entidadesKey) console.warn ("Criando evento sem entidades associadas.")

  const novoEvento = {
    ...data,
    tipoEventoId: tipoEvento.id,
    tipoEventoNome: tipoEvento.nome,
    origem,
    timestamp,
    entidadesKey,
  }

  return validarObjetoEvento(novoEvento)
}