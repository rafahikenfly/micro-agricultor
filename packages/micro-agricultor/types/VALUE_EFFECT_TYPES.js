export const VALUE_EFFECT_TYPES = {
    NONE: "nenhum",
    DELTA: "delta",
    MULTIPLIER: "multiplier",
    FIXED: "fixed",

}
export const EFEITO_VALOR = {
  [VALUE_EFFECT_TYPES.NONE]: { id: VALUE_EFFECT_TYPES.NONE, nome: "Nenhum", tagVariant: "light", },
  [VALUE_EFFECT_TYPES.DELTA]: { id: VALUE_EFFECT_TYPES.DELTA, nome: "Delta", tagVariant: "primary", },
  [VALUE_EFFECT_TYPES.MULTIPLIER]: { id: VALUE_EFFECT_TYPES.MULTIPLIER, nome: "Multiplicador",  tagVariant: "warning", },
  [VALUE_EFFECT_TYPES.FIXED]: { id: VALUE_EFFECT_TYPES.FIXED, nome: "Valor Fixo", tagVariant: "info", },
};
