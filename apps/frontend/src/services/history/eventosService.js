import { createHistoryService } from "micro-agricultor";
import { firebaseAdapter } from "../crud/firebaseAdapter"; //TODO: adapter na raiz do services?

export const eventosService = createHistoryService(firebaseAdapter, {
  collection: "eventos",
});