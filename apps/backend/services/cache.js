import { createCacheService } from "micro-agricultor";
import * as crud from "./crud.js";

const cache = createCacheService();

export const cacheService = {
  clearCache: cache.clearCache,
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
    ),
  getHortas: async () =>
    await cache.get(
      "hortas",
      crud.hortasService,
      [{ field: "isDeleted", op: "==", value: false }],
      { field: "nome" }
    ),
  getCaracteristicas: async () =>
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
    ),
  getDispositivos: async () =>
    await cache.get(
      "dispositivos",
      crud.dispositivosService,
      [{ field: "isDeleted", op: "==", value: false }],
    ),
  getTarefas: async () =>
    await cache.get(
      "tarefas",
      crud.tarefasService,
      [{ field: "isDeleted", op: "==", value: false }],
    ),
  getMidias: async () =>
    await cache.get(
      "midias",
      crud.midiasService,
      [{ field: "isDeleted", op: "==", value: false }],
    ),
  getModelosCV: async () =>
    await cache.get(
      "modelosCV",
      crud.modelosCVService,
      [{ field: "isDeleted", op: "==", value: false }],
    ),
  getEstagiosEspecie: async () =>
    await cache.get(
      "estagiosEspecie",
      crud.estagiosEspecieService,
      [{ field: "isDeleted", op: "==", value: false }],
    ),

  // DERIVED
  getEntidades() {
    const map = {
      [ENTIDADE.planta.id]: this.getPlantas,
      [ENTIDADE.canteiro.id]: this.getCanteiros,
      [ENTIDADE.horta.id]: this.getHortas,
    };

    return async (entidadeId) => {
      const fn = map[entidadeId];

      if (!fn) {
        throw new Error(`Cache não definido para entidade ${entidadeId}`);
      }

      return fn();
    };
  }    
};