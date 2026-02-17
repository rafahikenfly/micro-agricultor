import { createCRUDService } from "@shared/infra/crudFactory";
import { firebaseAdapter } from "./firebaseAdapter";

export const caracteristicasService = createCRUDService(firebaseAdapter, {
  collection: "caracteristicas",
  softDelete: true,
  useArchive: true,
});
