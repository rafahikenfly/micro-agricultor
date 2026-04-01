import { createHistoryService } from "micro-agricultor";
import { firebaseAdapter } from "./crud/firebaseAdapter";

export const eventosService = createHistoryService(firebaseAdapter, {
  collection: "eventos",
});

export const mutacoesService = createHistoryService(firebaseAdapter, {
  collection: "mutacoes",
});