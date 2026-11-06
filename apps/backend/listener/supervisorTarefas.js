import { ENTIDADE } from "micro-agricultor";
import { log } from "../core/logger/index.js";
import { adquirirTarefaGrbl } from "../core/mqtt/handleGRBLCNC.js";
import { db } from "../infra/firebase.js";
import { cacheService } from "../services/cache.js";
import { filaDispositivo } from "../core/mqtt/filaDispositivo.js";

export async function supervisorTarefas(client) {

  const cachePlantas = await cacheService.getPlantas();
  const cacheCanteiros = await cacheService.getCanteiros();

  const cacheMap = {
    [ENTIDADE.planta.id]: cachePlantas,
    [ENTIDADE.canteiro.id]: cacheCanteiros,
  }

  //TODO: Pegar todos os grblCNC do BD e criar uma fila para cada
  const grblCnc = {
      id: "cnc",
      grbl: {},
      xylema: {},
      atuador: {
          0: {ativo: false, label: "Desativado", estado: 0},
          1: {ativo: true, label: "Motor", estado: 0},
          2: {ativo: true, label: "Solenóide", estado: 0},
          3: {ativo: true, label: "Mini-bomba", estado: 0}
      },
      posicao: {
        x: 2500,
        y: 1500,
        z: 0,
      },
      dimensao: {
        x: 5000,
        y: 3000,
        z: 1000,
      }
  }
  const filaGrbl = new filaDispositivo(client, grblCnc)
  //EO TODO

  db.collection("tarefas").onSnapshot(
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const novaTarefa = change.doc.data();
          if (novaTarefa.agente && novaTarefa.agente.tipo === "GRBLCNC") {
            log("[supervisorTarefas] Nova tarefa atribuída a agente GRBLCnc. Adquirindo tarefa...");
            adquirirTarefaGrbl({
              filaGrbl,
              tarefa: novaTarefa,
              cache: cacheMap[novaTarefa.contexto.tipoEntidadeId]
            });
          }
          else log(`Nova tarefa no Firebase: ${change.doc.id}`);
        }
        if (change.type === "modified") {
          const novaTarefa = change.doc.data();
          if (novaTarefa.execucao.agente && novaTarefa.execucao.agente.tipo === "GRBLCNC") {
            log("[supervisorTarefas] Agente GRBLCNC detectado em tarefa. Adquirindo tarefa...");
            adquirirTarefaGrbl({
              filaGrbl,
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