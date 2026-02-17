import { createCRUDService } from "@shared/infra/crudFactory";
import { firebaseAdapter } from "./firebaseAdapter";

export const estagiosPlantaService = createCRUDService(firebaseAdapter, {
  collection: "estagios_planta", //TODO: snake - camel notation
  softDelete: true,
  useArchive: true,
});
