import { EFEITO, } from "../types/index.js";
import { calcularConfiancaPorTempoTotal, clamp, estimarDiasDaInformacao } from "./rulesUtils.js";

/**
 * Regra de evolução das características das entidades, aplicando obsolescência
 * e variação conforme o tempo decorrido desde o último cálculo.
 * @param {entidade, mapaCaracteristicas, eventoId, timestamp} args 
 * @returns {entidadeEvoluida, before, after}
 * - entidadeEvoluida: entidade com características evoluídas conforme o tempo decorrido
 * - before: estadoAtual da entidade antes da evolução, apenas com as características que sofreram mutação.
 * - after: estadoAtual da entidade após a evolução, apenas com as características que sofreram mutação (tipado para mutação).
 */
export function evoluirEntidade({entidade, mapaCaracteristicas, eventoId, timestamp}) {
  if (!entidade) throw new Error ("evoluirEntidade: entidade obrigatória.")
  if (!mapaCaracteristicas) throw new Error ("evoluirEntidade: mapaCaracteristicas obrigatório.")
  if (!eventoId) throw new Error ("evoluirEntidade: eventoId obrigatório.")
  if (!timestamp) throw new Error ("evoluirEntidade: timestamp obrigatório.")

  // Se não há condições de calcular ou entidade é morta, não há mutação.
  if (!entidade?.estadoAtual)  return {};
  if (entidade.isDeleted)      return {};
  if (entidade.isArchived)     return {};

  function podeEvoluir({estado, caracteristica}) {
    // Para poder evoluir, o estado precisa:
    // - existir
    // - ter uma data de cálculo
    // - aplicar pelo menos um efeito de tempo (obsolescência ou variação)
    // - ter valores para os efeitos de tempo selecionados (obsolescência e/ou variação)
    if (!estado)             return false;
    if (!caracteristica)     return false;
    if (!estado.calculadoEm) return false;
    if (!caracteristica.obsolescencia.ativo && !caracteristica.variacao.ativo) return false;
    if (caracteristica.obsolescencia.ativo) {
      if (!estado.confianca && !caracteristica.longevidade) {
        throw new Error(`${caracteristica.nome} com obsolescência inválida!`);
      }
    }
    if (caracteristica.variacao.ativo) {
      if (estado.valor === null && !caracteristica.variacao.valor){
        throw new Error(`${caracteristica.nome} com degradação inválida!`);
      }
    }
    return true;
  }

  const before = {};
  const after = {};
  const entidadeEvoluida = {
    ...entidade,
    estadoAtual: {
      ...(entidade.estadoAtual ?? {})
    },
  };

  // para cada caracteristica presente no estado atual
  for (const caracteristicaId of Object.keys(entidade.estadoAtual)) {
    const estado = entidade.estadoAtual[caracteristicaId];
    const caracteristica = mapaCaracteristicas.get(caracteristicaId);
    
    if (podeEvoluir({estado, caracteristica})) {

      const dtMs = timestamp - estado.calculadoEm;
      if (dtMs <= 0) {
        console.log(`Sem tempo mínimo decorrido para ${caracteristicaId} em ${entidade.id}`);
        continue;
      }

      const diasDecorridos = dtMs / (1000 * 60 * 60 * 24);

      // Calcula a nova confianca da característica
      let novaConfianca = estado.confianca;
      if (caracteristica.obsolescencia.ativo) {
        const diasEstimados = estimarDiasDaInformacao(
          estado.confianca,
          caracteristica.obsolescencia.longevidade
        );
        novaConfianca = calcularConfiancaPorTempoTotal(
          diasEstimados + diasDecorridos,
          caracteristica.obsolescencia.longevidade
        );
      }

      // Calcula novo valor da característica
      let novoValor = estado.valor;
      if (caracteristica.variacao.ativo) {
        novoValor = estado.valor + diasDecorridos * caracteristica.variacao.valor
      }

      // Processa a mutação
      if (novoValor !== estado.valor || novaConfianca !== estado.confianca) {
        before[caracteristicaId] = estado
        after[caracteristicaId] = {
          ...estado,
          tipo: "caracteristica",
          confianca: novaConfianca,
          valor: novoValor,
          calculadoEm: timestamp,
          eventos: [... (estado.eventos ?? []), eventoId],
        };
        // Reinicializa apenas a característica com a medida
        entidadeEvoluida.estadoAtual[caracteristicaId] = {...after[caracteristicaId]}
      }
    }

  }
  // Atualiza características alteradas
  entidadeEvoluida.estadoAtual = {...entidadeEvoluida.estadoAtual, ...after}

  return {entidadeEvoluida, before, after, operacao: "UPDATE"};
}

/**
 * Monitora uma entidade com as medidas fornecidas, retornando a entidade modificada.
 * @param {entidade, medidas, eventoId, timestamp} args 
 * @returns {entidade, before, after}
 * - entidade: entidade com características atualizadas conforme as medidas
 * - before: estadoAtual da entidade antes do manejo, apenas com as características que sofreram mutação
 * - after: estadoAtual da entidade após o manejo, apenas com as características que sofreram mutação (tipado para mutação).
 */
export function monitorarEntidade({entidade, medidas, eventoId, timestamp}) {
  if (!entidade) throw new Error ("monitorarEntidade: entidade obrigatório.")
  if (!medidas) throw new Error ("monitorarEntidade: medidas obrigatório.")
  if (!eventoId) throw new Error ("monitorarEntidade: eventoId obrigatório.")
  if (!timestamp) throw new Error("monitorarEntidade: timestamp obrigatório");

  // Cria uma cópia da entidade para não modificar o original, garantindo a existencia da chave estadoAtual
  const entidadeMonitorada = {
    ...entidade,
    estadoAtual: {
      ...(entidade.estadoAtual ?? {})
    },
  };
  const before = {}
  const after = {}

  // Processa as medidas da medicao
  Object.entries(medidas).forEach(([caracteristicaId, medida]) => {
    // Garante que a característica exista no estadoAtual
    before[caracteristicaId] = {...(entidadeMonitorada.estadoAtual[caracteristicaId] ?? {})}
    after[caracteristicaId] = {
      ...(entidadeMonitorada.estadoAtual[caracteristicaId] ?? {}),
      tipo: "caracteristica",
      valor: medida.valor,          // Reinicializa o valor
      confianca: medida.confianca,  // Reinicializa a confiança
      eventos: [eventoId],          // Reinicializa eventos com a medição
      manejos: [],                  // Limpa manejos anteriores após medição
      calculadoEm: timestamp,
    }
  });
  // Atualiza características alteradas
  entidadeMonitorada.estadoAtual = {...entidadeMonitorada.estadoAtual, ...after}
  return {entidade: entidadeMonitorada, before, after, operacao: "UPDATE"};
}

/**
 * Aplica um manejo em uma entidade, retornando a entidade modificada.
 * @param {entidade, manejo, eventoId, timestamp} args 
 * @returns {entidade, before, after}
 * - entidade: entidade com características atualizadas conforme o manejo
 * - before: estadoAtual da entidade antes do manejo, apenas com as características que sofreram mutação
 * - after: estadoAtual da entidade após o manejo, apenas com as características que sofreram mutação
 */
export const manejarEntidade = ({entidade, manejo, eventoId, timestamp}) => {
  if (!entidade) throw new Error ("manejarEntidade: entidade obrigatória.")
  if (!manejo) throw new Error ("manejarEntidade: manejo obrigatório.")
  if (!eventoId) throw new Error ("manejarEntidade: eventoId obrigatório.")
  if (!timestamp) throw new Error ("manejarEntidade: timestamp obrigatório.")

  // Cria uma cópia da entidade para não modificar a original, garantindo a existencia da chave estadoAtual
  const entidadeManejada = {
    ...entidade,
    estadoAtual: {
      ...(entidade.estadoAtual ?? {}),
    },
  };
  const before = {};
  const after = {};

  // O manejo tem efeitos em propriedades e em caracteríticas. Primeiro eu processo
  // os efeitos em propriedades (atualmente, estado e estágio). Depois processo as
  // características (estadoAtual). De qualquer forma, o after que é gerado pela função
  // tem o formato de {
  //    [caracteristicaId] : { valor, confiance, manejos, calculadoEm }
  // || [propKey]: { valor }
  // }

  // Atualiza o estado de destino da entidade conforme o manejo
  // Só há mudança de estado se a entidade estiver no estado de origem
  // E houver um estado de destino
  if (manejo.estadoDestinoId && entidade.estadoId === manejo.estadoOrigemId) {
    entidadeManejada.estadoId = manejo.estadoDestinoId;

    // Registra a mutação no after
    if (entidade.estadoId !== entidadeManejada.estadoId) {
      before.estadoId = {
        valor: entidade.estadoId,
      }
      after.estadoId = {
        tipo: "propriedade",
        valor: entidadeManejada.estadoId,
      }
    }
  }

  // Atualiza o estágio de destino da entidade conforme o manejo
  // Só há mudança de estágio se a entidade estiver no estagio de origem
  // E houver um estágio de destino
  if (manejo.estagioDestinoId && entidade.estagioId === manejo.estagioOrigemId) {
    entidadeManejada.estagioId = manejo.estagioDestinoId;

    // Registra a mutação no after
    if (entidade.estagioId !== entidadeManejada.estagioId) {
      before.estagioId = {
        valor: entidade.estagioId,
      }
      after.estagioId = {
        tipo: "propriedade",
        valor: entidadeManejada.estagioId,
      }
    }
  }

  // Processa os efeitos do manejo
  if (Array.isArray(manejo.efeitos)) {

    // Agrupa os efeitos por característica
    const efeitosPorCaracteristica = {};
    for (const efeito of manejo.efeitos) {
      const key = efeito.caracteristicaId;
      if (!efeitosPorCaracteristica[key]) {
        efeitosPorCaracteristica[key] = [];
      }
      efeitosPorCaracteristica[key].push(efeito);
    }

    // Processa os efeitos de cada caracteristicaId
    for (const [caracteristicaId, efeitos] of Object.entries(efeitosPorCaracteristica)) {

      const atual = entidadeManejada.estadoAtual[caracteristicaId] ?? {};

      // Salva o before
      before[caracteristicaId] = { ...atual };
      let novoValor = atual.valor ?? 0;
      let novaConfianca = atual.confianca ?? 0;

      // Aplica todos os efeitos da caracteristicaId
      for (const efeito of efeitos) {

        switch (efeito.tipoEfeitoValorId) {
          case EFEITO.NENHUM.id: break;
          case EFEITO.DELTA.id: novoValor += Number(efeito.efeitoValor); break;
          case EFEITO.MULTIPLICADOR.id: novoValor *= Number(efeito.efeitoValor); break;
          case EFEITO.FIXO.id: novoValor = Number(efeito.efeitoValor); break;
          default:
            throw new Error(`Tipo de efeito de valor ${efeito.tipoEfeitoValorId} inválido`);
        }

        switch (efeito.tipoEfeitoConfiancaId) {
          case EFEITO.NENHUM.id: break;
          case EFEITO.DELTA.id: novaConfianca += Number(efeito.efeitoConfianca); break;
          case EFEITO.MULTIPLICADOR.id: novaConfianca *= Number(efeito.efeitoConfianca); break;
          case EFEITO.FIXO.id: novaConfianca = Number(efeito.efeitoConfianca); break;
          default:
            throw new Error(`Tipo de efeito de confiança ${efeito.tipoEfeitoConfiancaId} inválido`);
        }
      }
      // Clamp de valor e confiança
      novaConfianca = clamp(novaConfianca, 0, 100);
      //TODO: Clamp do valor usando o min/max da caracteristica

      // Salva o after
      after[caracteristicaId] = {
        ... atual,
        tipo: "caracteristica",
        valor: novoValor,
        confianca: novaConfianca,
        manejos: [...(atual.manejos ?? []), eventoId],
        calculadoEm: timestamp,
      };
    }
}

  return { entidade: entidadeManejada, before, after, operacao: "UPDATE" }
}

/**
 * Transforma a posição de uma entidade, retornando a entidade modificada.
 * Se não há transformação, devolve a própria entidade sem before e after.
 * @param {entidade, posicao} args 
 * @returns {entidade, before, after}
 * - entidade: entidade com a posicao atualizada conforme o argumento
 * - before: posicao da entidade antes da movimentação
 * - after: posição da entidade após a movimentação (tipado para mutação)
 */
export function movimentarEntidade ({entidade, posicao}) {
  if (!entidade) throw new Error ("movimentarEntidade: entidade obrigatório.")
  if (!posicao) throw new Error ("movimentarEntidade: posicao obrigatório.")
 
  // Cria uma cópia da entidade para não modificar a original, garantindo a existencia da chave estadoAtual
  const entidadeMovimentada = {
    ...entidade,
    posicao: {
      ...(entidade.posicao ?? {x: 0, y: 0, z: 0}),
    },
  };

  const mudou =
    entidadeMovimentada.posicao.x !== posicao.x ||
    entidadeMovimentada.posicao.y !== posicao.y ||
    entidadeMovimentada.posicao.z !== posicao.z;

  if (!mudou) return {entidade}

  const before = {
    posicao: {
      valor: {...entidade.posicao}
    }
  }
  const after = {
    posicao: {
      tipo: "propriedade",
      valor: {...posicao},
    }
  }

  entidadeMovimentada.posicao = {...posicao}
  return { entidade: entidadeMovimentada, before, after, operacao: "UPDATE" }
}

/**
 * Transforma a dimensao de uma entidade, retornando a entidade modificada.
 * Recebe também o argumento da nova posição central da entidade.
 * Se não há transformação, devolve a própria entidade sem before e after.
 * @param {entidade, dimensao, posicao} args 
 * @returns {entidade, before, after}
 * - entidade: entidade com a posicao atualizada conforme o argumento
 * - before: posicao da entidade antes da movimentação
 * - after: posição da entidade após a movimentação (tipado para mutação)
 */
export function redimensionarEntidade ({entidade, dimensao, posicao}) {
  if (!entidade) throw new Error ("redimensionarEntidade: entidade obrigatório.")
  if (!dimensao) throw new Error ("redimensionarEntidade: dimensao obrigatório.")
  if (!posicao) throw new Error ("redimensionarEntidade: posicao obrigatório.")
 
  // Cria uma cópia da entidade para não modificar a original, garantindo a existencia da chave estadoAtual
  const entidadeRedimensionada = {
    ...entidade,
    dimensao: {
      ...(entidade.dimensao ?? {x: 0, y: 0, z: 0}),
    },
  };

  const mudou =
    entidadeRedimensionada.dimensao.x !== dimensao.x ||
    entidadeRedimensionada.dimensao.y !== dimensao.y ||
    entidadeRedimensionada.dimensao.z !== dimensao.z;

  if (!mudou) return {entidade}

  const before = {
    dimensao: {
      valor: {...entidade.dimensao}
    }
  }
  const after = {
    dimensao: {
      tipo: "propriedade",
      valor: {...dimensao},
    }
  }

  entidadeRedimensionada.dimensao = {...dimensao}
  entidadeRedimensionada.posicao  = {...posicao}

  return { entidade: entidadeRedimensionada, before, after, operacao: "UPDATE" }
}

// UNDER REVIEW
export function desenharEntidade ({entidade}) {
  if (!entidade) throw new Error ("desenharEntidade: entidade obrigatória.")

    //TODO: verificações da integridade da entidade?
  return { entidade, after: {valid: true} }
}

/**
 * Atualiza o estadoId de uma entidade, retornando a entidade modificada.
 * Se não há transformação, devolve a própria entidade sem before e after.
 * @param {entidade, estadoId} args 
 * @returns {entidade, before, after}
 * - entidade: entidade com o estadoId atualizado conforme o argumento
 * - before: estadoId da entidade antes da movimentação
 * - after: estadoId da entidade após a movimentação (tipado para mutação)
 */
export function atualizarEstadoEntidade ({entidade, estado}) {
  if (!entidade) throw new Error ("atualizarEstadoEntidade: entidade obrigatório.")
  if (!estado) throw new Error ("atualizarEstadoEntidade: estado obrigatório.")
 
  // Cria uma cópia da entidade para não modificar a original, garantindo a existencia da chave estadoAtual
  const entidadeAtualizada = {
    ...entidade,
  };

  const mudou =
    entidadeAtualizada.estadoId !== estado.id ||
    entidadeAtualizada.visivelNoMapa !== estado.propriedades?.visivelNoMapa

  if (!mudou) return {entidade}

  const before = {
    estadoId: {
      valor: entidade.estadoId
    }
  }
  const after = {
    estadoId: {
      tipo: "propriedade",
      valor: estado.id,
    }
  }

  entidadeAtualizada.estadoId = estado.id
  entidadeAtualizada.visivelNoMapa = estado.visivelNoMapa

  return { entidade: entidadeAtualizada, before, after, operacao: "UPDATE" }
}




// DEPRECATED
export function sanitizarPosDim ({entidade}) {
  const round = (v) => (typeof v === "number" ? Math.round(v) : v);

  if (entidade.posicao) {
    entidade.posicao.x = round(entidade.posicao.x);
    entidade.posicao.y = round(entidade.posicao.y);
    entidade.posicao.z = round(entidade.posicao.z);
  }

  if (entidade.dimensao) {
    entidade.dimensao.x = round(entidade.dimensao.x);
    entidade.dimensao.y = round(entidade.dimensao.y);
    entidade.dimensao.z = round(entidade.dimensao.z);
  }

  return entidade
}