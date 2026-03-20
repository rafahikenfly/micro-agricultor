import { createCRUDService } from "@shared/infra/crudFactory";
import { firebaseAdapter } from "./firebaseAdapter";

export const cvModelosService = createCRUDService(firebaseAdapter, {
  collection: "cvModelos",
  softDelete: true,
  useArchive: true,
});
