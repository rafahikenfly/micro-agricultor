import { createCRUDService } from "micro-agricultor";
import { firebaseAdapter } from "../infra/firebaseAdapter.js";

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

export const caracteristicasService = createCRUDService (firebaseAdapter, {
  collection: "caracteristicas",
  softDelete: true,
  useArchive: true,
});

export const tarefasService = createCRUDService(firebaseAdapter, {
  collection: "tarefas",
  softDelete: true,
  useArchive: true,
});

export const necessidadesService = createCRUDService(firebaseAdapter, {
  collection: "necessidades",
  softDelete: true,
  useArchive: true,
})

export const variedadesService = createCRUDService(firebaseAdapter, {
  collection: "variedades",
  softDelete: true,
  useArchive: true,
})

export const dispositivosService = createCRUDService(firebaseAdapter, {
  collection: "dispositivos",
  softDelete: true,
  useArchive: true,
})