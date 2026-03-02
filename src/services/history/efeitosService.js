import { createHistoryService } from "@shared/infra/historyFactory";
import { firebaseAdapter } from "../crud/firebaseAdapter";

export const historicoEfeitosService = createHistoryService(firebaseAdapter, {
  collection: "historicoEfeitos",
});