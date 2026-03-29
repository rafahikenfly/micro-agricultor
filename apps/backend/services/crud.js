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
