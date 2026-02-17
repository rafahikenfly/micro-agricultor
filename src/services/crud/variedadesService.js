import { createCRUDService } from "@shared/infra/crudFactory";
import { firebaseAdapter } from "./firebaseAdapter";

export const variedadesService = createCRUDService(firebaseAdapter, {
  collection: "variedades",
  softDelete: true,
  useArchive: true,
});