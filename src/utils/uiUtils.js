export function toggleSelecao(selecao = [], entidade, tipoEntidadeId) {
  const idx = selecao.findIndex(
    (s) =>
      s.tipoEntidadeId === tipoEntidadeId &&
      s.entidadeId === entidade.id
  );

  // não existe → adiciona
  if (idx === -1) {
    return [
      ...selecao,
      { entidadeId: entidade.id, tipoEntidadeId }
    ];
  }

  // existe → remove
  return selecao.filter((_, i) => i !== idx);
}

export function calcularCorHeatmap(valor, min, max) {
  if (valor === undefined || valor === null) return "#B0B0B0"; // desconhecido

  // clamp
  if (valor < min) valor = min;
  if (valor > max) valor = max;

  const t = (valor - min) / (max - min || 1); // 0..1

  const r = Math.round(255 * t);
  const g = 0;
  const b = Math.round(255 * (1 - t));

  return `rgb(${r},${g},${b})`;
}
