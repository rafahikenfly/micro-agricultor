import { createHistoryService } from "@shared/infra/historyFactory";
import { firebaseAdapter } from "../crud/firebaseAdapter"; //TODO: adapter na raiz do services?

export const eventosService = createHistoryService(firebaseAdapter, {
  collection: "eventos",
});