import { createCRUDService } from "micro-agricultor";
import { firebaseAdapter } from "./firebaseAdapter";

export const canteirosService = createCRUDService(firebaseAdapter, {
  collection: "canteiros",
  softDelete: true,
  useArchive: true,
});