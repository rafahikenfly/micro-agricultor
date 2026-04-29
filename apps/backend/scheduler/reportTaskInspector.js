import { ESTADO_TAREFA, ORIGEM } from "micro-agricultor";
import { batchService, cacheService, relatoriosService } from "../services/index.js";
import { log } from "../core/logger/index.js";
import { gerarRelatorioPython } from "../core/python/index.js";
import { bucket } from "../infra/firebase.js";
import fs from "fs";


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
    await batch.commitIfNeeded();

    const { caracteristicasId, plantasId, canteirosId } = relatorio.contexto;
    const timestamp = Date.now()

    try {
      const entidadesIds = [...plantasId, ...canteirosId]
      const outputPath = await gerarRelatorioPython({
        caracteristica_ids: caracteristicasId,
        entidade_ids: entidadesIds,
        data_inicio: relatorio.inicio,
        data_fim: relatorio.fim
      });

      if (!outputPath) {
        log(`[reportTaskInspector]: Relatório ${relatorio.id} sem dados.`)
        continue;
      }
      const destination = `relatorios/${relatorio.id}_${timestamp}.png`

      // Sobe o arquivo, torna público (mais simples pro frontend) e limpa o arquivo temporário
      await bucket.upload(outputPath, {
        destination,
        metadata: {
          contentType: "image/png",
        },
      });

      const file = bucket.file(destination);
      await file.makePublic();
      fs.unlinkSync(outputPath);

      // Atualiza relatório
      relatorio.estado = relatorio.resultado
        ? ESTADO_TAREFA.FEITO.id
        : ESTADO_TAREFA.ERRO.id;
      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
      relatorio.resultado = {
        url: fileUrl,
        geradoEm: timestamp,
      };
      log(`[reportTaskInspector]: Enviado para ${fileUrl}`);
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