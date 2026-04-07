import { createCacheService } from "micro-agricultor";
import * as crud from "./crud.js";

const cache = createCacheService();

export const cacheService = {
  getPlantas: async () =>
    await cache.get(
      "plantas",
      crud.plantasService,
      [{ field: "isDeleted", op: "==", value: false }],
      { field: "nome" }
    ),
  getCanteiros: async () =>
    await cache.get(
      "canteiros",
      crud.canteirosService,
      [{ field: "isDeleted", op: "==", value: false }],
      { field: "nome" }
    ),  getCaracteristicas: async () =>
    await cache.get(
      "caracteristicas",
      crud.caracteristicasService,
      [{ field: "isDeleted", op: "==", value: false }],
    ),
  getVariedades: async () =>
    await cache.get(
      "variedades",
      crud.variedadesService,
      [{ field: "isDeleted", op: "==", value: false }],
    ),
  getNecessidades: async () =>
    await cache.get(
      "necessidades",
      crud.necessidadesService,
      [{ field: "isDeleted", op: "==", value: false }],
    )

};