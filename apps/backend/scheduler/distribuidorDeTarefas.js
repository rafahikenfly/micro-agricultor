import { ENTIDADE, entidadesAoAlcance, ESTADO_TAREFA, indiceCapaz, RECORRENCIA } from "micro-agricultor";
import { cacheService, tarefasService } from "../services";
import { log } from "../core/logger";

export async function distribuidorDeTarefas() {
  try {
    cacheService.clearCache("tarefas")
    const tarefasPendentes = (await cacheService
        .getTarefas())
        .list
        .filter(t => t.estado === ESTADO_TAREFA.PENDENTE.id);
    const dispositivos = await cacheService.getDispositivos();
    const plantas = await cacheService.getPlantas();
    const canteiros = await cacheService.getCanteiros();

    const mapEntidades = {
      [ENTIDADE.planta.id]: plantas,
      [ENTIDADE.canteiro.id]: canteiros,
    }

    const tarefasOrdenadas = ordenarPrioridades(tarefasPendentes);

    // Percorre cada tarefa ordenada para verificar e atribuir um dispositivo
    for (const tarefa of tarefasOrdenadas) {
      const tarefaComAgente = atribuiAgente(tarefa, dispositivos, mapEntidades);
      
      if (tarefaComAgente) {
        tarefasService.update(
          tarefasService.getRefById(tarefa.id),
          tarefaComAgente,
          {nome: "BACKEND", uid:"adquirirTarefa"}
        );
        log(`[distribuidorDeTarefas] Tarefa ${tarefaComAgente.id} distribuida para ${tarefaComAgente.execucao.agente.id}`)
        
        // Caso queira salvar/atualizar cada tarefa imediatamente no serviço:
        // await cacheService.atualizarTarefa(tarefaComAgente);
      }
    }
  }
  catch {
    
  }
}

function atribuiAgente(tarefa, dispositivos, mapEntidades) {
  const contexto = tarefa.contexto || {};

  // Recupera as entidades
  const mapAtual = mapEntidades[contexto.tipoEntidadeId]?.map;
  const entidadesTarefa = contexto.entidadesId
    .map(entId => mapAtual?.get(entId))
    .filter(Boolean); // Remove valores undefined ou null caso a entidade não seja encontrada

  // Verifica se há dispositivo com capacidade e alcance de realizar a tarefa
  const dispositivoApto = dispositivos.find(disp => {
    if (indiceCapaz({ disp, tarefa }) !== -1) return false;
    if (entidadesAoAlcance({ disp, entidadesTarefa }).length > 0) return false;

    return true;
  });

  // Retorna a tarefa atribuída ou nulo
  if (dispositivoApto) {
    return {
      ...tarefa,
      execucao: {
        ...tarefa.execucao,
        agente: {
          tipo: dispositivoApto.tipo,
          id: dispositivoApto.id
        }
      }
    };
  }
  return null;
}
function ordenarPrioridades(tarefas) {
  return tarefas.sort((a, b) => {
    
    // Critério 1: Estado da atividade (ERRO > PENDENTE > Outros)
    const pesoEstado = (estado) => {
      if (estado === "ERRO") return 3;
      if (estado === "PENDENTE") return 2;
      return 1;
    };
    const estadoA = ESTADO_TAREFA[a.estado].prioridade;
    const estadoB = ESTADO_TAREFA[b.estado].prioridade;
    if (estadoA !== estadoB) return estadoB - estadoA; // Maior peso primeiro

    // Critério 2: Vencimento crescente
    const vencimentoA = a.planejamento?.venceEm ? new Date(a.planejamento.venceEm).getTime() : Infinity;
    const vencimentoB = b.planejamento?.venceEm ? new Date(b.planejamento.venceEm).getTime() : Infinity;
    if (vencimentoA !== vencimentoB) return vencimentoA - vencimentoB;

    // Critério 3: Planejamento / Prioridade numérica - Quanto menor, mais importante
    const prioA = a.planejamento?.prioridade ?? 999;
    const prioB = b.planejamento?.prioridade ?? 999;
    if (prioA !== prioB) return prioA - prioB;

    // Critério 4: Planejamento / Recorrência
    const recA = RECORRENCIA[a.planejamento?.tipoRecorrenciaId].prioridade;
    const recB = RECORRENCIA[b.planejamento?.tipoRecorrenciaId].prioridade;
    if (recA !== recB) return recB - recA; // Maior peso primeiro

    return 0;
  });

}