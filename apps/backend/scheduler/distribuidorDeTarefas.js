import { ENTIDADE } from "micro-agricultor";
import { cacheService } from "../services";

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

        const tarefasDisponiveis = filtrarTarefas(tarefasPendentes, dispositivos, mapEntidades);
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
    if (!temCapacidade({ disp, tarefa })) return false;         // Capacidade
    return entidadesTarefa.som(ent => temAlcance({disp, ent})); // Alcance
  })

  // Retorna a tarefa atribuída
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

/**
 * Filtra tarefas executáveis e as ordena por importância.
 * @param {Array} tarefas - Lista de tarefas vindas do Firestore
 * @param {Array} dispositivos - Lista de dispositivos/agentes GRBL conectados com seus estados e alcances
 */
function processarEOrdenarTarefasParaInspetor(tarefas, dispositivos) {
  

  // 2. ORDENAÇÃO: Critérios de Importância
  return tarefasCompativeis.sort((a, b) => {
    
    // Critério 1: Estado da atividade (ERRO > PENDENTE > Outros)
    const pesoEstado = (estado) => {
      if (estado === "ERRO") return 3;
      if (estado === "PENDENTE") return 2;
      return 1;
    };
    const scoreA = pesoEstado(a.estado);
    const scoreB = pesoEstado(b.estado);
    if (scoreA !== scoreB) return scoreB - scoreA; // Maior peso primeiro

    // Critério 2: Vencimento (`venceEm`) - Quanto mais cedo, mais importante (crescente)
    const vencimentoA = a.venceEm ? new Date(a.venceEm).getTime() : Infinity;
    const vencimentoB = b.venceEm ? new Date(b.venceEm).getTime() : Infinity;
    if (vencimentoA !== vencimentoB) return vencimentoA - vencimentoB;

    // Critério 3: Planejamento / Prioridade numérica - Quanto menor, mais importante
    const prioA = a.planejamento?.prioridade ?? 999;
    const prioB = b.planejamento?.prioridade ?? 999;
    if (prioA !== prioB) return prioA - prioB;

    // Critério 4: Planejamento / Recorrência
    const recA = a.planejamento?.tipoRecorrenciaId;
    const recB = b.planejamento?.tipoRecorrenciaId;
    
    const temRecA = recA && recA !== "NENHUMA";
    const temRecB = recB && recB !== "NENHUMA";

    // O que tem recorrência tem prioridade sobre o que não tem
    if (temRecA && !temRecB) return -1;
    if (!temRecA && temRecB) return 1;

    // Se ambos têm recorrência, menor intervalo tem maior prioridade
    if (temRecA && temRecB) {
      const intervaloA = a.planejamento?.intervaloRecorrenciaMinutos || 0;
      const intervaloB = b.planejamento?.intervaloRecorrenciaMinutos || 0;
      if (intervaloA !== intervaloB) return intervaloA - intervaloB;
    }

    return 0;
  });
}
}