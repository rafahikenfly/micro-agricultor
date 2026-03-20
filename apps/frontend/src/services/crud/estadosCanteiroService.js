import { createCRUDService } from "micro-agricultor";
import { firebaseAdapter } from "./firebaseAdapter";

export const estadosCanteiroService = createCRUDService(firebaseAdapter, {
  collection: "estados_canteiro", //TODO: snake - camel notation
  softDelete: true,
  useArchive: true,
});
