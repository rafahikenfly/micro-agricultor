export const REASON_TYPES = {
  LOW_CONFIDENCE: "low confidence",
  NO_VALUE: "no value",
  LOWER_BOUND: "lower_bound",
  UPPER_BOUND: "higher_bound",
  MANUAL: "manual",
}

export const REASON = {
 [REASON_TYPES.LOW_CONFIDENCE]: {id: REASON_TYPES.LOW_CONFIDENCE, nome: "Baixa confiança de valor"},
 [REASON_TYPES.NO_VALUE]: {id: REASON_TYPES.NO_VALUE, nome: "Sem medida de valor relevante"},
 [REASON_TYPES.LOWER_BOUND]: {id: REASON_TYPES.LOWER_BOUND, nome: "Abaixo da faixa ideal"},
 [REASON_TYPES.UPPER_BOUND]: {id: REASON_TYPES.UPPER_BOUND, nome: "Acima da faixa ideal"},
 [REASON_TYPES.MANUAL]: {id: REASON_TYPES.MANUAL, nome: "Manual"},
}