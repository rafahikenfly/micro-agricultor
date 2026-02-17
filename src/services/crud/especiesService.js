import { createCRUDService } from "@shared/infra/crudFactory";
import { firebaseAdapter } from "./firebaseAdapter";

export const especiesService = createCRUDService(firebaseAdapter, {
  collection: "especies",
  softDelete: true,
  useArchive: true,
});
