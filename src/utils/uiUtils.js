export function toggleSelecao(selecao = [], entidadeId) {
  const existe = selecao.includes(entidadeId);

  if (!existe) {
    // adiciona
    return [...selecao, entidadeId];
  }

  // remove
  return selecao.filter(id => id !== entidadeId);
}

export function calcularCorHeatmap(valor, min, max) {
  if (valor == null) return "#808080"; // desconhecido

  // clamp
  if (valor < min) valor = min;
  if (valor > max) valor = max;

  const t = (valor - min) / (max - min || 1); // 0..1

  const r = Math.round(255 * t);
  const g = 0;
  const b = Math.round(255 * (1 - t));

  return `rgb(${r},${g},${b})`;
}
