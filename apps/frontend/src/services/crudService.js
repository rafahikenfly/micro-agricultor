import { createCRUDService } from "micro-agricultor";
import { firebaseAdapter } from "./crud/firebaseAdapter";

export const plantasService = createCRUDService (firebaseAdapter, {
  collection: "plantas",
  softDelete: true,
  useArchive: true,
});

export const canteirosService = createCRUDService (firebaseAdapter, {
  collection: "canteiros",
  softDelete: true,
  useArchive: true,
});

export const hortasService = createCRUDService (firebaseAdapter, {
  collection: "hortas",
  softDelete: true,
  useArchive: true,
});

export const caracteristicasService = createCRUDService (firebaseAdapter, {
  collection: "caracteristicas",
  softDelete: true,
  useArchive: true,
});

export const manejosService = createCRUDService (firebaseAdapter, {
  collection: "manejos",
  softDelete: true,
  useArchive: true,
});

export const especiesService = createCRUDService (firebaseAdapter, {
  collection: "especies",
  softDelete: true,
  useArchive: true,
});

export const variedadesService = createCRUDService (firebaseAdapter, {
  collection: "variedades",
  softDelete: true,
  useArchive: true,
});

export const midiasService = createCRUDService (firebaseAdapter, {
  collection: "midias",
  softDelete: true,
  useArchive: true,
});

export const estadosCanteiroService = createCRUDService (firebaseAdapter, {
  collection: "estados_canteiro",
  softDelete: true,
  useArchive: true,
});

export const estadosPlantaService = createCRUDService (firebaseAdapter, {
  collection: "estados_planta",
  softDelete: true,
  useArchive: true,
});

export const estagiosEspecieService = createCRUDService (firebaseAdapter, {
  collection: "estagios_especie",
  softDelete: true,
  useArchive: true,
});

export const usuariosService = createCRUDService (firebaseAdapter, {
  collection: "usuarios",
  softDelete: true,
  useArchive: true,
});

export const categoriasEspecieService = createCRUDService (firebaseAdapter, {
  collection: "categorias_especies",
  softDelete: true,
  useArchive: true,
});
