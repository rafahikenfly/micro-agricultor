import { createCRUDService } from "@shared/infra/crudFactory";
import { firebaseAdapter } from "./firebaseAdapter";

export const hortaService = createCRUDService(firebaseAdapter, { //TODO: plural nesse service
  collection: "hortas",
  softDelete: true,
  useArchive: true,
});