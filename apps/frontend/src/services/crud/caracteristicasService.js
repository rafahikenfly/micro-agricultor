import { createCRUDService } from "micro-agricultor";
import { firebaseAdapter } from "./firebaseAdapter";

export const caracteristicasService = createCRUDService(firebaseAdapter, {
  collection: "caracteristicas",
  softDelete: true,
  useArchive: true,
});
