export function monitorarEstadoAtual({entidade, medidas, eventoId, timestamp}) {
  if (!entidade) throw new Error ("monitorarEstadoAtual: entidade obrigatório.")
  if (!medidas) throw new Error ("monitorarEstadoAtual: caracteristicasMedidas obrigatório.")
  if (!eventoId) throw new Error ("monitorarEstadoAtual: eventoId obrigatório.")
  if (!timestamp) throw new Error("monitorarEstadoAtual: timestamp obrigatório");

  // Cria uma cópia do canteiro para não modificar o original, garantindo a existencia da chave estadoAtual
  const entidadeMonitorada = {
    ...entidade,
    estadoAtual: {
      ...(entidade.estadoAtual ?? {})
    },
  };
  const before = {}
  const after = {}

  // Processa as medidas da medicao
  Object.entries(medidas).forEach(([caracteristicaId, medida]) => {
    // Garante que a característica exista no estadoAtual
    before[caracteristicaId] = {...(entidadeMonitorada.estadoAtual[caracteristicaId] ?? {})}
    after[caracteristicaId] = {
      valor: medida.valor,          // Reinicializa o valor
      confianca: medida.confianca,  // Reinicializa a confiança
      eventos: [eventoId],          // Reinicializa eventos com a medição
      manejos: [],                  // Limpa manejos anteriores após medição
      calculadoEm: timestamp,
    }
    // Reinicializa apenas a característica com a medida
    entidadeMonitorada.estadoAtual[caracteristicaId] = {...after[caracteristicaId]}
  });
  return {entidadeMonitorada, before, after};
}
