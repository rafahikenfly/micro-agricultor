import { createCRUDService } from "@shared/infra/crudFactory";
import { firebaseAdapter } from "./firebaseAdapter";

export const plantasService = createCRUDService(firebaseAdapter, {
  collection: "plantas",
  softDelete: true,
  useArchive: true,
});