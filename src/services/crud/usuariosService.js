import { createCRUDService } from "@shared/infra/crudFactory";
import { firebaseAdapter } from "./firebaseAdapter";

export const usuariosService = createCRUDService(firebaseAdapter, {
  collection: "usuarios",
  softDelete: true,
  useArchive: true,
});