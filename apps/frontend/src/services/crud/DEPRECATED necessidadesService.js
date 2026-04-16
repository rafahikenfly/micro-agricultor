import { createCRUDService } from "micro-agricultor";
import { firebaseAdapter } from "./firebaseAdapter";

const baseService = createCRUDService(firebaseAdapter, {
  collection: "necessidades",
});

export const __necessidadesService = {
  ...baseService,

    async getByEntidade(entidadeId) {
      return baseService.get(
        [{ field: "entidadeId", op: "==", value: entidadeId }]
      );
    },
    async getByEntidadesArray(entidadesIds = []) {
      if (!entidadesIds.length) return [];
    
      const chunkSize = 10;
      const chunks = [];
    
      for (let i = 0; i < entidadesIds.length; i += chunkSize) {
        chunks.push(entidadesIds.slice(i, i + chunkSize));
      }
    
      const results = await Promise.all(
        chunks.map(chunk =>
          baseService.get([
            { field: "entidadeId", op: "in", value: chunk }
          ])
        )
      );
    
      return results.flat();
    }
};