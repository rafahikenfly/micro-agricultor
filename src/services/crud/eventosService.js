import { db, timestamp } from "../../firebase";
import { createCRUDService } from "./crudService";

export const eventosService = createCRUDService("eventos");

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
