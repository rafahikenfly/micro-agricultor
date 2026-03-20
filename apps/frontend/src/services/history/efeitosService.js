import { createHistoryService } from "micro-agricultor";
import { firebaseAdapter } from "../crud/firebaseAdapter";

export const historicoEfeitosService = createHistoryService(firebaseAdapter, {
  collection: "historicoEfeitos",
});