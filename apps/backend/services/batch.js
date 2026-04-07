import { createBatchService } from "micro-agricultor";
import { db } from "../infra/firebase.js";

export const batchService = createBatchService({
  createNativeBatch: () => db.batch()
});