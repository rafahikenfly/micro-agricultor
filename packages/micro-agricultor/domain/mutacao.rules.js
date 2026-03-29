export const criarMutacao = ({evento, caracteristicaId,antes,depois,tipoEntidadeId,entidade}) => {
    return {
        tipoEventoId: evento.tipoEventoId,
        tipoEventoNome: evento.tipoEventoNome,
        eventoId: evento.id,
        caracteristicaId,
        valor: depois.valor,
        valorAntes: antes?.valor ?? null,
        confianca: depois.confianca,
        confiancaAntes: antes?.confianca ?? null,
        tipoEntidadeId,
        entidadeId: entidade.id,
        timestamp: evento.timestamp
      }}