export const criarMutacao = ({evento, caracteristicaId, antes, depois, tipoEntidadeId, entidade, propriedade}) => {

  if (caracteristicaId && propriedade) {
    throw new Error("criarMutação: Mutação não pode ter caracteristicaId e propriedade ao mesmo tempo.");
  }

  if (!caracteristicaId && !propriedade) {
    throw new Error("criarMutação: Mutação precisa de caracteristicaId ou propriedade.");
  }

  let payload = {}
  if (caracteristicaId) payload = {
      caracteristicaId,
      valor: depois.valor,
      valorAntes: antes?.valor ?? null,
      confianca: depois.confianca,
      confiancaAntes: antes?.confianca ?? null,
    }
  else payload = {
    propriedade,
    valor: depois,
    valorAntes: antes,
  }
  return {
    tipoEventoId: evento.tipoEventoId,
    tipoEventoNome: evento.tipoEventoNome,
    eventoId: evento.id,
    tipoEntidadeId,
    entidadeId: entidade.id,
    timestamp: evento.timestamp,
    ...payload,
  }
}