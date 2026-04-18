import { resolverTarefa } from "../../domain/index.js";
import { RESOLUCAO } from "../../types/index.js";

export async function inspecionar({
  tarefas,
  agente,
  user,
  timestamp,
  services, //batch, tarefas, necessidades
}) {
  // ======
  // Validações
  // ======
  if (!tarefas?.length) {
    throw new Error("Nenhuma tarefa para inspeção.");
  }
  const batch = services.batch;
  console.log(`Inspecionando ${tarefas.length} tarefa(s)...`);
  
  // Buscar todas as necessidades ativas uma só vez
  const necessidadesAtivas = await services.necessidades.get([
    { field: "ativo", op: "==", value: true }
    ]
  );

  // Mapeia as necessidades por vínculo
  const necessidadesPorVinculo = necessidadesAtivas.reduce((map, necessidade) => {
    const key = necessidade.vinculo?.id;
    if (!key) return map;
    
    if (!map[key]) {
        map[key] = [];
    }
    
    map[key].push(necessidade);
    return map;
  }, {});

  // ======
  // Tarefa
  // ======
  // Processa cada entidade do array
  for (const tarefa of tarefas) {
    await batch.commitIfNeeded();

    const execucao = tarefa.execucao;
    const necessidades = necessidadesPorVinculo[tarefa.id] ?? [];

    // Identifica o tipo de resolução
    let tipoResolucaoId = null;

    // ======
    // 1. ERROS
    // ======
    if (execucao) {
      if (execucao.tentativas > execucao.maxTentativas) {
        tipoResolucaoId = RESOLUCAO.FALHADO.id;
      } 
      else if (timestamp > execucao.expiraEm) {
        tipoResolucaoId = RESOLUCAO.EXPIRADO.id;
      }
    }

    // ======
    // 2. RESOLUÇÃO NORMAL
    // ======
    if (!tipoResolucaoId) {
      if (necessidades.length > 0) {
        continue; // ainda não pode resolver
      }

      tipoResolucaoId = RESOLUCAO.CONCLUIDO.id;
    }    
    
    // ======
    // 3. EXECUTA RESOLUÇÃO
    // ======
    const results = resolverTarefa({
        tarefa,
        timestamp,
        agente,
        tipoResolucaoId,
      });
    
    // Atualiza a tarefa pelo batch
    const tarefaRef = services.tarefas.getRefById(tarefa.id);
    batch.add((b)=>services.tarefas.batchUpsert(tarefaRef, results.tarefaResolvida, user, b));
    // Resultado sem nova tarefa
    if (results.novaTarefa) {
      batch.add((b)=>services.tarefas.batchCreate(results.novaTarefa, user, b));
    }
  }

  // Commit final
  await batch.commit();

  console.log("Inspeção de tarefas concluído.");
  return;
}