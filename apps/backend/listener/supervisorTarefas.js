import { ENTIDADE } from "micro-agricultor";
import { log } from "../core/logger/index.js";
import { adquirirTarefaGrbl } from "../core/mqtt/handleGRBLCNC.js";
import { db } from "../infra/firebase.js";
import { cacheService } from "../services/cache.js";
import { filaDispositivo } from "../core/mqtt/filaDispositivo.js";

export async function supervisorTarefas(client) {

  const cachePlantas = await cacheService.getPlantas();
  const cacheCanteiros = await cacheService.getCanteiros();
  const cacheDispositivos = await cacheService.getDispositivos();
  
  const cacheMap = {
    [ENTIDADE.planta.id]: cachePlantas,
    [ENTIDADE.canteiro.id]: cacheCanteiros,
  }

  const filas = {};
  cacheDispositivos.list.forEach((dispositivo) => {
    if (dispositivo.tipo === "GRBL") {
      const filaGrbl = new filaDispositivo(client, dispositivo)
      log(`[supervisorTarefas] Fila criada para dispositivo GRBLCNC: ${dispositivo.id}`);
      filas[dispositivo.id] = filaGrbl;
    }
  });

  db.collection("tarefas").onSnapshot(
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const tarefa = change.doc.data();
          tarefa.id = change.doc.id;
          if (tarefa.execucao?.agente?.tipo === "GRBL" && tarefa.execucao?.agente?.id) {
            // Tarefa associada a um agente específico
            log("[supervisorTarefas] Nova tarefa atribuída a agente GRBLCnc. Adquirindo tarefa...");
            adquirirTarefaGrbl({
              filaGrbl: filas[tarefa.execucao.agente.id],
              tarefa,
              cache: cacheMap[tarefa.contexto.tipoEntidadeId]
            });
          }
          else log(`Nova tarefa no Firebase: ${change.doc.id}`);
        }
        if (change.type === "modified") {
          const novaTarefa = change.doc.data();
          if (novaTarefa.execucao.agente && novaTarefa.execucao.agente.tipo === "GRBL" && novaTarefa.execucao?.agente?.id) {
            // Tarefa associada a um agente específico
            log("[supervisorTarefas] Tarefa atribuída a agente GRBLCnc. Adquirindo tarefa...");
            adquirirTarefaGrbl({
              filaGrbl: filas[novaTarefa.execucao.agente.id],
              tarefa: novaTarefa,
              cache: cacheMap[novaTarefa.contexto.tipoEntidadeId]
            });
          }
        }
        if (change.type === "removed") {
          log(`Tarefa removida no firebase: ${docId}`);
          // Lógica opcional para exclusão
        }        
      });
    },
    (error) => {
      log(`Erro no listener do Firestore: ${error.message}`);
    }
  );
  log("Listener de tarefas online");
}