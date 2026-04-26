import { OPERADOR, ORIGEM } from "micro-agricultor/types/index.js";
import { log } from "../core/logger/index.js";
import { batchService, cacheService, plantasService } from "../services/index.js";

const compararComOperador = (valor, operador, valorReferencia) => {
  switch (operador) {
    case OPERADOR.EQUAL.id:   return valor === valorReferencia
    case OPERADOR.LOWER.id:   return valor <= valorReferencia
    case OPERADOR.GREATER.id: return valor >= valorReferencia
    default:
      console.warn(`Erro na comparação com o operador ${operador}.`);
      return false; 
  }
}

export async function plantStageInspector() {
  log("[plantStageInspector]: Iniciando inspeção de estágios...");
  const user = { uid: "plantStageInspector", nome: ORIGEM.BACKEND.id };
  const timestamp = Date.now();

  const cachePlantas = await cacheService.getPlantas();
  const cacheVariedades = await cacheService.getVariedades();
  
  log(`[plantStageInspector]: ${cachePlantas.list.length} plantas para inspecionar estágio...`);
  let batch = batchService.create();

  for (const planta of cachePlantas.list) {
    if (!planta.requerMonitoramento) continue;

    await batch.commitIfNeeded();

    const variedade = cacheVariedades.map.get(planta.variedadeId);
    const proximoEstagio = variedade.ciclo[planta.estagioIndex + 1];
    if (!proximoEstagio) continue;

    // Verifica tamanho da planta
    const tamanhoMinimoAtendido = 
      planta.dimensao.x >= proximoEstagio.dimensao.x &&
      planta.dimensao.y >= proximoEstagio.dimensao.y &&
      planta.dimensao.z >= proximoEstagio.dimensao.z

    // Verifica regras de transicao
    let todasAsRegrasAtendidas = true;
    if (proximoEstagio.transicao) {
      const regras = Object.values(proximoEstagio.transicao);
      todasAsRegrasAtendidas = regras.every(regra => {
        const valorCaracteristica = planta.estadoAtual[regra.caracteristicaId];
        return compararComOperador(valorCaracteristica.valor, regra.operador, regra.limite);
      });
    }

    if (todasAsRegrasAtendidas && tamanhoMinimoAtendido) {
      
      planta.estagioIndex++;
      const novoEstagio = variedade.ciclo[planta.estagioIndex];
      planta.estagioId = novoEstagio.estagioId
      const plantaRef = plantasService.getRefById(planta.id);
      batch.add((b)=>plantasService.batchUpdate(plantaRef, planta, user, b));
    }
  }

  await batch.commit();
  log(`[currentStateInspector]: Inspeção de estágios (plantas e canteiros) concluída.`);
}