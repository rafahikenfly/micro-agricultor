import { ESTADO_TAREFA, inspecionarTarefa } from "micro-agricultor";
import { tarefasService, cacheService } from "../services/index.js";
import { log } from "../core/logger/index.js";

async function taskStateInspector() {
    //rodar pelo BATCH
    try {
        const tarefasPendentes = await tarefasService.get({
            estado: ESTADO_TAREFA.PENDENTE.id
        });

        // Buscar todas as necessidades ativas uma vez usando cache
        const necessidadesAtivas = (await cacheService.getNecessidades()).filter(n => n.ativo);
        const necessidadesPorVinculo = necessidadesAtivas.reduce((map, necessidade) => {
            if (!map[necessidade.vinculo.id]) {
                map[necessidade.vinculo.id] = [];
            }
            map[necessidade.vinculo.id].push(necessidade);
            return map;
        }, {});

        for (const tarefa of tarefasPendentes) {
            // batch add
            await inspecionarTarefa(tarefa, necessidadesPorVinculo[tarefa.id]);
        }
    } catch (error) {
        log('Erro ao inspecionar tarefas pendentes:', error);
        throw error;
    }
}

