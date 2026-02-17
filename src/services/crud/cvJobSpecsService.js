import { createCRUDService } from "@shared/infra/crudFactory";
import { firebaseAdapter } from "./firebaseAdapter";

export const cvJobSpecsService = createCRUDService(firebaseAdapter, {
  collection: "cvJobSpecs",
  softDelete: true,
  useArchive: true,
});
