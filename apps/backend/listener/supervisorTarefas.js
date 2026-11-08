import { ENTIDADE, podeAdquirirTarefa } from "micro-agricultor";
import { log } from "../core/logger/index.js";
import { db } from "../infra/firebase.js";
import { cacheService } from "../services/cache.js";
import { adquirirTarefaGrbl, liberarTarefaGrbl } from "../core/devices/handleGRBLCNC.js";
import { getFila } from "../core/mqtt/index.js";

export async function supervisorTarefas() {
  const cachePlantas = await cacheService.getPlantas();
  const cacheCanteiros = await cacheService.getCanteiros();
  
  const cacheMap = {
    [ENTIDADE.planta.id]: cachePlantas,
    [ENTIDADE.canteiro.id]: cacheCanteiros,
  }


  db.collection("tarefas").onSnapshot(
    async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        const timestamp = Date.now();
        const tarefa = change.doc.data();
        if (!tarefa.id) tarefa.id = change.doc.id;
        if (podeAdquirirTarefa({tarefa, timestamp})) {
          //Tarefas que podem ser adquiridas e que têm tipo de agente já definido, são encaminhadas
          switch (tarefa.execucao?.agente?.tipo) {
            case "GRBL":
              if (change.type === "added")    await encaminhaTarefaGrbl({tarefa, timestamp});
              if (change.type === "modified") await encaminhaTarefaGrbl({tarefa, timestamp});
              if (change.type === "removed")  log(`Tarefa removida no firebase: ${tarefa.id}`);
              break;
            default:
              log(`Sem tipo de agente definido na tarefa ${tarefa.id}`);
              break;
          }
        }        
      };
    },
    (error) => {
      log(`Erro no listener do Firestore: ${error.message}`);
    }
  );
  log("Listener de tarefas online");

  async function encaminhaTarefaGrbl ({tarefa, timestamp}) {
    if (!tarefa.id) {console.error(`Tarefa criada em ${tarefa.createdAt} sem id`); return}
    // Pode ser um agente específico ou um agente indeterminado
    const fila = getFila(tarefa.execucao.agente.id)
    if (fila) {
      log(`[supervisorTarefas] Nova tarefa atribuída a GRBL ${tarefa.execucao.agente.id}. Adquirindo tarefa ${tarefa.id}...`);
      await adquirirTarefaGrbl({
        filaGrbl: fila,
        tarefa,
        cache: cacheMap[tarefa.contexto.tipoEntidadeId],
        eventos: {
            onError: (erro)=>{console.log(erro), liberarTarefaGrbl({tarefa, erro})},
            onQueue: ()=>{},
            onComplete: ()=>{console.log(`Tarefa ${tarefa.id} completa`); liberarTarefaGrbl({tarefa})},
        },
        timestamp
      });
    }
    else {
      log("[supervisorTarefas] Nova tarefa atribuída a um agente tipo GRBL indeterminado. Definindo agente...");
      //TODO
    }
  }

}
