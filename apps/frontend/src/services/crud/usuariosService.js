import { createCRUDService } from "micro-agricultor";
import { firebaseAdapter } from "./firebaseAdapter";

export const usuariosService = createCRUDService(firebaseAdapter, {
  collection: "usuarios",
  softDelete: true,
  useArchive: true,
});