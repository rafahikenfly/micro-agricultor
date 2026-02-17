//import "module-alias/register.js"; // entry point (ESM)

import { onSchedule } from "firebase-functions/v2/scheduler";
import admin from "firebase-admin";
import { Timestamp } from "@google-cloud/firestore";

import { recalcularCaracteristicasCanteiro } from "../shared/domain/canteiro.rules.js";
import { processarEventoComEfeitos } from "../shared/domain/evento.rules.js";
import { createCRUDService } from "../shared/infra/crudFactory.js";
import { firebaseAdapter } from "./firebaseAdapter.js";

admin.initializeApp();
const db = admin.firestore();
/* ---------- Função agendada ---------- */
export const timeEffect = onSchedule(
  {
    schedule: "every 12 hours",
    timeZone: "America/Sao_Paulo",
  },
  async () => {
    console.log("Iniciando atualização de características de canteiros");
    const user = {id: "timeEffect", nome: "firebase functions" }

    const ts = Timestamp.now();

    // Carrega catálogo uma única vez
    const catalogoSnap = await db.collection("caracteristicas").get();
    const catalogo = catalogoSnap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    // Monta services 
    const eventosService = createCRUDService(firebaseAdapter, {
      collection: "eventos",
      softDelete: true,
      useArchive: true,
    });
    const historicoEfeitosService = createCRUDService(firebaseAdapter, {
      collection: "historicoEfeitos",
      softDelete: true,
      useArchive: true,
    });

      // Busca todas as hortas
    const hortasSnap = await db.collection("hortas").get();

      for (const hortaDoc of hortasSnap.docs) {
      const entidadeService = createCRUDService(firebaseAdapter, {
        collection: "hortas",
        parentId: hortaDoc.id,
        subCollection: "canteiros",
        softDelete: true,
        useArchive: true,
      });


      // Monta alvos
      const alvos = [];

      // Busca todos os canteiros da horta
      const canteirosSnap = await hortaDoc.ref
        .collection("canteiros")
        .get();
      // Inclui todos no formato de [data: {}, tipoEntidadeId: "canteiro"]
      for (const canteiroDoc of canteirosSnap.docs) {
        // ignora entidades mortas
        if (canteiroDoc.data().isDeleted) continue;
        if (canteiroDoc.data().isArchived) continue;        
        // inclui no array
        alvos.push({ data: canteiroDoc.data(), tipoEntidadeId: "canteiro" });
      }

      try {
        const results = await  processarEventoComEfeitos({
          tipoEventoId: "atualizacao",
          alvos,
          origem: {id: "scheduler", tipo: "sistema"},
          regra: recalcularCaracteristicasCanteiro,
          contexto: {
            catalogo: catalogo,
            timestamp: ts,
          },
          user,
          db, 
          services: { eventosService, historicoEfeitosService, entidadeService },
          createdAt: ts,
        })
        console.log(`Atualização de canteiros finalizada na horta ${hortaDoc.id}. ${results.opCount} operações registradas.`);
        console.log(results.evento);
      }
      catch (err) {
        console.log (`Erro atualizando canteiros da horta ${hortaDoc.id}:`, err);
      }
    }
  }
);
