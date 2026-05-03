import { createCacheService, ENTIDADE } from "micro-agricultor";
import * as crud from "./crudService.js";
import * as hist from "./historyService.js"

const cache = createCacheService();

export const cacheService = {
  clearCache: cache.clearCache,
  // CRUD
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
  getEstadosCanteiro: async () =>
    await cache.get(
      "estados_canteiro",
      crud.estadosCanteiroService,
      [{ field: "isDeleted", op: "==", value: false }],
      { field: "nome" }
    ),
  getEstadosPlanta: async () =>
    await cache.get(
      "estados_planta",
      crud.estadosPlantaService,
      [{ field: "isDeleted", op: "==", value: false }],
      { field: "nome" }
    ),
  getEstagiosEspecie: async () =>
  await cache.get(
    "estagios_especie",
    crud.estagiosEspecieService,
    [{ field: "isDeleted", op: "==", value: false }],
    { field: "nome" }
  ),
  getCaracteristicas: async () =>
    await cache.get(
      "caracteristicas",
      crud.caracteristicasService,
      [{ field: "isDeleted", op: "==", value: false }],
    ),
  getManejos: async () =>
    await cache.get(
      "manejos",
      crud.manejosService,
      [{ field: "isDeleted", op: "==", value: false }],
    ),
  getEspecies: async () =>
    await cache.get(
      "especies",
      crud.especiesService,
      [{ field: "isDeleted", op: "==", value: false }],
    ),
  getVariedades: async () =>
    await cache.get(
      "variedades",
      crud.variedadesService,
      [{ field: "isDeleted", op: "==", value: false }],
    ),
  getMidias: async () =>
    await cache.get(
      "midias",
      crud.midiasService,
      [{ field: "isDeleted", op: "==", value: false }],
    ),
  getTarefas: async () =>
    await cache.get(
      "tarefas",
      crud.tarefasService,
      [{ field: "isDeleted", op: "==", value: false }],
    ),
  getUsuarios: async () =>
    await cache.get(
      "usuarios",
      crud.usuariosService,
      [{ field: "isDeleted", op: "==", value: false }],
    ),
  getCategoriasEspecie: async () =>
    await cache.get(
      "categoriasEspecie",
      crud.categoriasEspecieService,
      [{ field: "isDeleted", op: "==", value: false }],
    ),
  //HIST
  getEventos: async () =>
    await cache.get(
      "eventos",
      hist.eventosService,
      [],
      {field: "persistedAt", direction: "desc"}
    ),
  getMutacoes: async () =>
    await cache.get(
      "mutacoes",
      hist.mutacoesService,
      [],
      {field: "persistedAt", direction: "desc"}
    ),
  getModelosCV: async () =>
    await cache.get(
      "modelosCV",
      crud.modelosCVService,
      [{ field: "isDeleted", op: "==", value: false }],
    ),
  // DERIVED
  getEntidades: async () => {
    const [plantas, canteiros, hortas] = await Promise.all([
      cacheService.getPlantas(),
      cacheService.getCanteiros(),
      cacheService.getHortas(),
    ]);

    return {
      [ENTIDADE.planta.id]: plantas,
      [ENTIDADE.canteiro.id]: canteiros,
      [ENTIDADE.horta.id]: hortas,
    };
  },

};