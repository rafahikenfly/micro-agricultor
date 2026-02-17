import { createCRUDService } from "@shared/infra/crudFactory";
import { firebaseAdapter } from "./firebaseAdapter";

export const cvJobRunsService = createCRUDService(firebaseAdapter, {
  collection: "cvJobRuns",
  softDelete: true,
  useArchive: true,
});
