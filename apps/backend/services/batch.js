import { createBatchFactory } from "micro-agricultor";
import { db } from "../infra/firebase";

export const batchService = createBatchFactory({
  createNativeBatch: () => db.batch()
});