import { nowTimestamp, timestamp } from "../firebase";
const estadoInicial = {
  id: "Gcam9slyNqHMx2flaGfP",
  nome: "Vazio",
}
const aparenciaPadrao = {
    fundo: "#4CAF50",
    borda: "#1B5E20",
    espessura: 2,
    geometria: "circle",
    vertices: [],
};
const vetorPadrao = {
  x: 0,
  y: 0,
  z: 0,
};

const canteiroPadrao = {
  aparencia: aparenciaPadrao,
  posicao: vetorPadrao,
  dimensao: { x: 30, y: 30, z: 0},
  estadoId: estadoInicial.id,
  estadoNome: estadoInicial.nome,
  nome: "Novo canteiro",
  descricao: "",
  hortaId: "",
  hortaNome: "",
  estadoAtual: {},
}

export const validarCanteiro = (dataObj = {}) => {
    const valid = mergeComValidacao(canteiroPadrao, dataObj);
    return valid;
}

/**
 * Aplica um manejo já registrado em um canteiro, retornando o canteiro modificado.
 * @param {*} canteiro - entidade do canteiro a ser manejado
 * @param {*} manejo - entidade do manejo a ser aplicado
 * @param {*} logManejo - entidade do log de manejo associado a esta aplicação
 * @returns {canteiroMonitorado, relatorioEfeitos}
 */
export function manejarCanteiro({canteiro, manejo, eventoId}) {
  if (!canteiro) throw new Error ("Erro monitorando canteiro: canteiro obrigatório.")
  if (!manejo) throw new Error ("Erro monitorando canteiro: manejo obrigatório.")
  if (!eventoId) throw new Error ("Erro monitorando canteiro: eventoId obrigatório.")

  const ts = nowTimestamp();
  // Cria uma cópia do canteiro para não modificar o original, garantindo a existencia da chave estadoAtual
  const canteiroManejado = {
    ...canteiro,
    estadoAtual: {
      ...(canteiro.estadoAtual ?? {}),
    },
  };

  // Atualiza o estado de destino do canteiro conforme o manejo
  if (manejo.estadoDestinoId) {
    canteiroManejado.estadoId = manejo.estadoDestinoId;
    canteiroManejado.estadoNome = manejo.estadoDestinoNome;
  }

  // Processa os efeitos do manejo
  if (Array.isArray(manejo.efeitos)) {
    manejo.efeitos.forEach((ef) => {
      // Garante que a característica exista no estadoAtual
      const atual = canteiroManejado.estadoAtual[ef.caracteristicaId] ?? {};

      let novoValor = atual.valor;
      // Calcula o novo valor conforme o tipo
      switch (ef.tipoEfeitoId) {
        case "delta": novoValor += Number(ef.valorEfeito); break;
        case "multiplicador":  novoValor *= Number(ef.valorEfeito); break;
        case "fixo": novoValor = Number(ef.valorEfeito); break;
        default:
          throw new Error( `Tipo de efeito ${ef.tipoEfeitoId} inválido` );
      }

      // Atualiza a característica com a medida, limpando eventos e manejos anteriores
      canteiroManejado.estadoAtual[ef.caracteristicaId] = {
        ...atual,
        valor: novoValor,                           // Novo valor da característica
        confianca: Number(ef?.valorConfianca) ?? 0, // Nova confiança da característica (se houver)
        manejos: [...atual.manejos, eventoId],      // Adiciona manejos aos anteriores
        // TODO: se um manejo tiver duas vezes a mesma caracteristica, o manejo aparecerá duplicado aqui.
        calculadoEm: ts,
      };
    });
  }
  return canteiroManejado
}


/**
 * Monitorar um canteiro com as medidas fornecidas, retornando o canteiro modificado. O Monitoramento
 * é aplicado reinicializando os valores das características medidas, limpando eventos e manejos anteriores
 * do cálculo do Estado Atual da característica atualizada.
 * @param {object} canteiro 
 * @param {object} medidas 
 * @param {string} eventoId 
 * @returns canteiroMonitorado
 */
export function monitorarCanteiro({canteiro, medidas, eventoId}) {
  if (!canteiro) throw new Error ("Erro monitorando canteiro: canteiro obrigatório.")
  if (!medidas) throw new Error ("Erro monitorando canteiro: medidas obrigatório.")
  if (!eventoId) throw new Error ("Erro monitorando canteiro: eventoId obrigatório.")

  const ts = timestamp();

  // Cria uma cópia do canteiro para não modificar o original, garantindo a existencia da chave estadoAtual
  const canteiroMonitorado = {
    ...canteiro,
    estadoAtual: {
      ...(canteiro.estadoAtual ?? {})
    },
  };

  // Processa as medidas da medicao
  Object.entries(medidas).forEach(([caracteristicaId, medida]) => {
    // Garante que a característica exista no estadoAtual
    const atual = canteiroMonitorado.estadoAtual[caracteristicaId] ?? {};

    // Reinicializa a característica com a medida, limpando eventos e manejos anteriores
    canteiroMonitorado.estadoAtual[caracteristicaId] = {
      ...atual,
      valor: medida.valor,          // Reinicializa o valor
      confianca: medida.confianca,  // Reinicializa a confiança
      eventos: [eventoId],          // Reinicializa eventos com a medição
      manejos: [],                  // Limpa manejos anteriores após medição
      calculadoEm: ts,
    };
  });
  return canteiroMonitorado;
}

export function degradarCaracteristicasCanteiro({canteiro, catalogo, eventoId}) {
  if (!canteiro) throw new Error ("Erro degradando caracteristicas do canteiro: canteiro obrigatório.")
  if (!catalogo) throw new Error ("Erro degradando caracteristicas do canteiro: catalogo obrigatório.")
  if (!eventoId) throw new Error ("Erro degradando caracteristicas do canteiro: eventoId obrigatório.")

  if (!canteiro?.estadoAtual) return null;

  const now = nowTimestamp();
  const novoEstadoAtual = { ...canteiro.estadoAtual };

  for (const caracteristicaId of Object.keys(novoEstadoAtual)) {
    const caracteristica = novoEstadoAtual[caracteristicaId];
    const caracteristicaCatalogo = catalogo.find(
      c => c.id === caracteristicaId
    );

    if (!caracteristica ||
      !caracteristica.calculadoEm ||
      !caracteristicaCatalogo?.longevidade) {
      continue;
    }

    const dtMs = now.toMillis() - caracteristica.calculadoEm.toMillis();
    if (dtMs <= 0) continue;

    const diasDecorridos = dtMs / (1000 * 60 * 60 * 24);
    const k = 100 / caracteristicaCatalogo.longevidade;
    const novaConfianca = caracteristica.confianca - diasDecorridos * k;
    //TODO: degradar valor

    novoEstadoAtual[caracteristicaId] = {
      ...caracteristica,
      confianca: Number(Math.max(0, novaConfianca).toFixed(2)),
      calculadoEm: now,
      eventos: [... caracteristica.eventos, eventoId],
    };
  }

  return {
    ...canteiro,
    estadoAtual: novoEstadoAtual,
  };
}

export function criarCanteiro({horta, nome, estadoId, estadoNome, descricao, dimensao, aparencia, posicao}) {
  if (!horta) throw new Error ("Erro criando canteiro: horta obrigatória.")

  return {
    hortaId: horta.id,
    hortaNome: horta.nome,
    estadoId: estadoId || estadoInicial.id,
    estadoNome: estadoNome || estadoInicial.nome,
    nome: nome || "Novo canteiro",
    descricao: descricao || "",
    aparencia: {...aparenciaPadrao, ...aparencia},
    posicao: {...vetorPadrao, ...posicao},
    dimensao: {...vetorPadrao, ...dimensao},
  }
}