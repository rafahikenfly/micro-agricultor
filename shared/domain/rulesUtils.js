export function mergeComValidacao(padrao, obj) {
  if (obj === undefined || obj === null) return padrao;

  // Se o padrão não é objeto, valida tipo simples
  if (typeof padrao !== "object" || padrao === null || Array.isArray(padrao)) {
    // Mantém o valor do obj apenas se for do mesmo tipo
    return typeof obj === typeof padrao ? obj : padrao;
  }

  // Merge profundo para objetos
  const resultado = Array.isArray(padrao) ? [] : {};
  for (const key in padrao) {
    resultado[key] = mergeComValidacao(padrao[key], obj[key]);
  }

  // Copia campos extras do obj que não existem no padrão
  for (const key in obj) {
    if (!(key in padrao)) resultado[key] = obj[key];
  }

  return resultado;
}

export function estimarDiasDaInformacao(confiancaAtual, longevidade) {
  if (!longevidade || longevidade <= 0) return null;
  if (confiancaAtual <= 0) return null;
  if (isNaN(confiancaAtual)) return null;

  const lambda = -Math.log(0.2) / longevidade;

  const t = -Math.log(confiancaAtual / 100) / lambda;

  return t; // dias estimados
}

export function calcularConfiancaPorTempoTotal(diasTotais, longevidade) {
  if (!longevidade || longevidade <= 0) return 0;
  const lambda = -Math.log(0.2) / longevidade;
  return 100 * Math.exp(-lambda * diasTotais);
}