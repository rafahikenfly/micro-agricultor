import { ESTADO_TAREFA, inspecionar, ORIGEM } from "micro-agricultor";
import { batchService, cacheService, necessidadesService, tarefasService } from "../services/index.js";
import { log } from "../core/logger/index.js";

export async function taskStateInspector() {
    const agente = {tipo: "inspector", id: "taskStateInspector"}
    const user = { uid: "dailyEvolution", nome: ORIGEM.BACKEND.id };
    const timestamp = Date.now();
    //Monta o batch
    let batch = batchService.create();


    try {
      const tarefasPendentes = (await cacheService
        .getTarefas())
        .list
        .filter(t =>t.estado === ESTADO_TAREFA.PENDENTE.id);

      await inspecionar({
        tarefas: tarefasPendentes,
        agente,
        user,
        timestamp,
        services: {
          batch,
          necessidades: necessidadesService,
          tarefas: tarefasService,
        }
      })
    } catch (error) {
        log('Erro ao inspecionar tarefas pendentes:', error);
        throw error;
    }
}

