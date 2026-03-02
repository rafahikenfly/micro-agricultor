import { createCRUDService } from "@shared/infra/crudFactory";
import { firebaseAdapter } from "./firebaseAdapter";

export const tarefasService = createCRUDService(firebaseAdapter, {
  collection: "tarefas",
  softDelete: true,
  useArchive: true,
});