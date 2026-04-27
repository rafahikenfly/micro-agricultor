import { ESTADO_TAREFA, ORIGEM } from "micro-agricultor";
import { batchService, cacheService, relatoriosService } from "../services/index.js";
import { log } from "../core/logger/index.js";
import { gerarRelatorioPython } from "../core/python/index.js";

export async function reportTaskInspector() {
  log("[reportTaskInspector]: Iniciando inspeção de relatórios...");
  const user = { uid: "reportTaskInspector", nome: ORIGEM.BACKEND.id };

  // Obtem os relatórios pendentes de processamento
  const relatoriosPendentes = (await cacheService
    .getRelatorios())
    .list
    .filter((r) => r.estado === ESTADO_TAREFA.PENDENTE.id);

  if (!relatoriosPendentes.length) {
    log("[reportTaskInspector]: Nenhum relatório pendente");
    return;
  }
  // =========
  // Processamento
  // =========
  let batch = batchService.create();
  for (const relatorio of relatoriosPendentes) {
    console.log(relatorio)
    await batch.commitIfNeeded();

    const { caracteristicasId, plantasId, canteirosId } = relatorio.contexto;
    const timestamp = Date.now()

    try {
      const entidadesIds = [...plantasId, ...canteirosId]
      const outputPath = await gerarRelatorioPython({
        db_path: "sensores.db",
        caracteristica_ids: caracteristicasId,
        entidade_ids: entidadesIds,
        data_inicio: relatorio.inicio,
        data_fim: relatorio.fim
      });
      // Upload do resultado para storage (Firestore Storage ou bucket)
      const fileName = `relatorios/${relatorio.id}_${timestamp}.png`;
      const fileUrl = "teste"//await firestore.uploadFile(outputPath, fileName);

      // Atualiza resultado do relatório
      relatorio.resultado = {
        url: fileUrl,
        geradoEm: timestamp,
      };
      console.log("a",relatorio)

    } catch (err) {
      log(`[reportTaskInspector]: Erro ao gerar relatório ${relatorio.id}`, err);
    }

    // Marca como finalizado (ou poderia ter estado ERRO)
    relatorio.estado = ESTADO_TAREFA.FEITO.id;

    const relatorioRef = relatoriosService.getRefById(relatorio.id);
    batch.add((b) =>
      relatoriosService.batchUpdate(relatorioRef, relatorio, user, b)
    );
  }
  await batch.commit();

  log("[reportTaskInspector]: Inspeção de relatórios concluída.");
}