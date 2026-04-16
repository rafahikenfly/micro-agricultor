import { createCRUDService } from "micro-agricultor";
import { firebaseAdapter } from "./firebaseAdapter";

export const plantasService = createCRUDService(firebaseAdapter, {
  collection: "plantas",
  softDelete: true,
  useArchive: true,
});