import { createCRUDService } from "micro-agricultor";
import { firebaseAdapter } from "./firebaseAdapter";

export const especiesService = createCRUDService(firebaseAdapter, {
  collection: "especies",
  softDelete: true,
  useArchive: true,
});
