import { createBatchService } from "micro-agricultor";
import { db } from "../firebase";

export const batchService = createBatchService({
  createNativeBatch: () => db.batch()
});