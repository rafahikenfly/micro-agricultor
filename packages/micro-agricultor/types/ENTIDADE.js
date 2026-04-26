import { VARIANTE } from "./index.js";

export const ENTIDADE = {
  canteiro: {
    id: "canteiro",
    nome: "Canteiro",
    masculino: true,
    variant: VARIANTE.YELLOW.id,
    desenhavel: true,
    monitoravel: true,
    manejavel: true,
    inspecionavel: true,
  },
  planta: {
    id: "planta",
    nome: "Planta",
    masculino: false,
    variant: VARIANTE.GREEN.id,
    desenhavel: true,
    monitoravel: true,
    manejavel: true,
    inspecionavel: true,
  },
  horta: {
    id: "horta",
    nome: "Horta",
    masculino: false,
    variant: VARIANTE.GREY.id,
    desenhavel: false,
    monitoravel: true,
    manejavel: false,
    inspecionavel: false,
  },
};
