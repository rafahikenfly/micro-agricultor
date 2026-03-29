import { createCacheService } from "micro-agricultor";
import { plantasService, caracteristicasService } from "./crud.js";

const cache = createCacheService();

export const cacheService = {
  getPlantas: async () =>
    await cache.get(
      "plantas",
      plantasService,
      [{ field: "isDeleted", op: "==", value: false }],
      { field: "nome" }
    ),
  getCaracteristicas: async () =>
    await cache.get(
      "caracteristicas",
      caracteristicasService,
      [{ field: "isDeleted", op: "==", value: false }],
    )
};