export const VARIANT_TYPES = {
    DARKBLUE: "primary",
    GREY: "secondary",
    GREEN: "success",
    RED: "danger",
    YELLOW: "warning",
    LIGHTBLUE: "info",
    WHITE: "light",
    BLACK: "dark",
}
export const VARIANTS = {
    [VARIANT_TYPES.DARKBLUE]: { id: "primary", nome: "Azul", tagVariant: "primary"},
    [VARIANT_TYPES.GREY]: { id: "secondary", nome: "Cinza", tagVariant: "secondary"},
    [VARIANT_TYPES.GREEN]: { id: "success", nome: "Verde", tagVariant: "success"},
    [VARIANT_TYPES.RED]: { id: "danger", nome: "Vermelho", tagVariant: "danger"},
    [VARIANT_TYPES.YELLOW]: { id: "warning", nome: "Amarelo", tagVariant: "warning"},
    [VARIANT_TYPES.LIGHTBLUE]: { id: "info", nome: "Azul claro", tagVariant: "info"},
    [VARIANT_TYPES.WHITE]: { id: "light", nome: "Branco", tagVariant: "light"},
    [VARIANT_TYPES.BLACK]: { id: "dark", nome: "Preto", tagVariant: "dark"},
}