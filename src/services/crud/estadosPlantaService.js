import { createCRUDService } from "@shared/infra/crudFactory";
import { firebaseAdapter } from "./firebaseAdapter";

export const estadosPlantaService = createCRUDService(firebaseAdapter, {
  collection: "estados_planta", //TODO: snake - camel notation
  softDelete: true,
  useArchive: true,
});
