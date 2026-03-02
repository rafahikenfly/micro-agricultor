import { createCRUDService } from "@infra/crudFactory";
import { firebaseAdapter } from "./firebaseAdapter";

export const canteirosService = createCRUDService(firebaseAdapter, {
  collection: "canteiros",
  softDelete: true,
  useArchive: true,
});