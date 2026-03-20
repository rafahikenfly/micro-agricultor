import { createCRUDService } from "micro-agricultor";
import { firebaseAdapter } from "./firebaseAdapter";

export const midiasService = createCRUDService(firebaseAdapter, {
  collection: "midias",
  softDelete: true,
  useArchive: true,
});
