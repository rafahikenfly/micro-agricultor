import { createCRUDService } from "@shared/infra/crudFactory";
import { firebaseAdapter } from "./firebaseAdapter";

export const eventosService = createCRUDService(firebaseAdapter, {
  collection: "eventos",
  softDelete: true,
  useArchive: true,
});

/*
export async function completarEfeitosLog({eventoId, efeitos = {}, data = {}}) {
  const ts = timestamp();
  const batch = db.batch();

  // 1. atualiza o log (merge!)
  const logRef = db.collection("eventos").doc(eventoId);
  batch.set(
    logRef,
    { ...data, efeitos: efeitos },
    { merge: true }
  );
  // 2. denormalização para /efeitosHistorico
  Object.entries(efeitos).forEach(
    ([caracteristicaId, efeito]) => {
      const efeitoRef = db.collection("efeitosEvento").doc();

      batch.set(efeitoRef, {
        ...efeito,
        ...data,
        eventoId: eventoId,
        caracteristicaId,
        timestamp: ts,
      });
    }
  );

  await batch.commit();
}
*/