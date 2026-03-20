import { createCRUDService } from "micro-agricultor";
import { firebaseAdapter } from "./firebaseAdapter";

export const variedadesService = createCRUDService(firebaseAdapter, {
  collection: "variedades",
  softDelete: true,
  useArchive: true,
});