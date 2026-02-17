import { createCRUDService } from "@shared/infra/crudFactory";
import { firebaseAdapter } from "./firebaseAdapter";

export const categoriasEspecieService = createCRUDService(firebaseAdapter, {
  collection: "categorias_especies", //TODO: snake - camel notation
  softDelete: true,
  useArchive: true,
});
