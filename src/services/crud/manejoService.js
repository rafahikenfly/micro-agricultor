import { createCRUDService } from "@shared/infra/crudFactory";
import { firebaseAdapter } from "./firebaseAdapter";

export const manejoService = createCRUDService(firebaseAdapter, { //TODO: plural nesse service
  collection: "manejos",
  softDelete: true,
  useArchive: true,
});