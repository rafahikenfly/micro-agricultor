import { createCRUDService } from "micro-agricultor";
import { firebaseAdapter } from "./firebaseAdapter";

export const manejoService = createCRUDService(firebaseAdapter, { //TODO: plural nesse service
  collection: "manejos",
  softDelete: true,
  useArchive: true,
});