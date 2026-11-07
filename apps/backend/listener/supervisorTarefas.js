import { ENTIDADE } from "micro-agricultor";
import { log } from "../core/logger/index.js";
import { db } from "../infra/firebase.js";
import { cacheService } from "../services/cache.js";
import { filaDispositivo } from "../core/mqtt/filaDispositivo.js";
import { adquirirTarefaGrbl } from "../core/devices/handleGRBLCNC.js";

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
          if (tarefa.execucao?.agente?.tipo === "GRBL") encaminhaTarefaGrbl(tarefa, filas);
          // else if para outros tipos de dispositivo
          else log(`Nova tarefa no Firebase: ${tarefa.id}`);
        }
        if (change.type === "modified") {
          const tarefa = change.doc.data();
          if (tarefa.execucao?.agente?.tipo === "GRBL") encaminhaTarefaGrbl(tarefa, filas);
          // else if para outros tipos de dispositivo
          else log(`Nova tarefa no Firebase: ${tarefa.id}`);
        }
        if (change.type === "removed") {
          log(`Tarefa removida no firebase: ${docId}`);
        }        
      });
    },
    (error) => {
      log(`Erro no listener do Firestore: ${error.message}`);
    }
  );
  log("Listener de tarefas online");

  function encaminhaTarefaGrbl (tarefa, filas) {
    // Pode ser um agente específico ou um agente indeterminado
    if (filas[tarefa.execucao.agente.id]) {
      log("[supervisorTarefas] Nova tarefa atribuída a um agente tipo GRBL. Adquirindo tarefa...");
      adquirirTarefaGrbl({
        filaGrbl: filas[tarefa.execucao.agente.id],
        tarefa,
        cache: cacheMap[tarefa.contexto.tipoEntidadeId]
      });
    }
    else {
      log("[supervisorTarefas] Nova tarefa atribuída a um agente tipo GRBL indeterminado. Definindo agente...");
      //TODO
    }
  }
}
