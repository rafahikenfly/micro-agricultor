export const ENTITY_TYPES = {
    CANTEIRO: "canteiro",
    HORTA: "horta",
    PLANTA: "planta",
}
export const ENTIDADE = {
  [ENTITY_TYPES.CANTEIRO]: {
    id: "canteiro",
    nome: "Canteiro",
    tagVariant: "warning",
    desenhavel: true,
    monitoravel: true,
    manejavel: true,
    inspecionavel: true,
  },
  [ENTITY_TYPES.PLANTA]: {
    id: "planta",
    nome: "Planta",
    tagVariant: "success",
    desenhavel: false,
    monitoravel: true,
    manejavel: true,
    inspecionavel: true,
  },
  [ENTITY_TYPES.HORTA]: {
    id: "horta",
    nome: "Horta",
    tagVariant: "primary",
    desenhavel: false,
    monitoravel: true,
    manejavel: false,
    inspecionavel: false,
  },
};
