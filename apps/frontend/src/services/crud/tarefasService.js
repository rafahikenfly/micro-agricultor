import { createCRUDService } from "micro-agricultor";
import { firebaseAdapter } from "./firebaseAdapter";

export const tarefasService = createCRUDService(firebaseAdapter, {
  collection: "tarefas",
  softDelete: true,
  useArchive: true,
});