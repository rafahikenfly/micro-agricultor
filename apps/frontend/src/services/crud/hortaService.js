import { createCRUDService } from "micro-agricultor";
import { firebaseAdapter } from "./firebaseAdapter";

export const hortaService = createCRUDService(firebaseAdapter, { //TODO: plural nesse service
  collection: "hortas",
  softDelete: true,
  useArchive: true,
});