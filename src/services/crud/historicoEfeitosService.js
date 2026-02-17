import { createCRUDService } from "@shared/infra/crudFactory";
import { firebaseAdapter } from "./firebaseAdapter";

export const historicoEfeitosService = createCRUDService(firebaseAdapter, {
  collection: "historicoEfeitos",
  softDelete: true,
  useArchive: true,
});