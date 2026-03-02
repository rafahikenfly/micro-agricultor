import { ENTITY_TYPES } from "../types/ENTITY_TYPES.js";
import { REASON_TYPES } from "../types/REASON_TYPES.js";
import { monitorarEstadoAtual } from "./monitoramento.rules.js";
import { calcularConfiancaPorTempoTotal, estimarDiasDaInformacao, mergeComValidacao } from "./rulesUtils.js";

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

/**
 * Protege contra problemas no objeto.
 * @param {*} dataObj 
 * @returns 
 */
export const validarObjetoCanteiro = (dataObj = {}) => {
  // TODO: validações do objeto (tipos, etc..)
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
export function manejarCanteiro({canteiro, manejo, eventoId, timestamp}) {
  if (!canteiro) throw new Error ("Erro monitorando canteiro: canteiro obrigatório.")
  if (!manejo) throw new Error ("Erro monitorando canteiro: manejo obrigatório.")
  if (!eventoId) throw new Error ("Erro monitorando canteiro: eventoId obrigatório.")

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
    for (const efeito of manejo.efeitos) {
      // Garante que a característica exista no estadoAtual
      const atual = canteiroManejado.estadoAtual[efeito.caracteristicaId] ?? {};

      let novoValor = atual.valor;
      // Calcula o novo valor conforme o tipo
      switch (efeito.tipoEfeitoId) {
        case "delta": novoValor += Number(efeito.valorEfeito); break;
        case "multiplicador":  novoValor *= Number(efeito.valorEfeito); break;
        case "fixo": novoValor = Number(efeito.valorEfeito); break;
        default:
          throw new Error( `Tipo de efeito ${efeito.tipoEfeitoId} inválido` );
      }

      // Atualiza a característica com a medida, limpando eventos e manejos anteriores
      canteiroManejado.estadoAtual[efeito.caracteristicaId] = {
        ...atual,
        valor: novoValor,                           // Novo valor da característica
        confianca: Number(efeito?.valorConfianca) ?? 0, // Nova confiança da característica (se houver)
        manejos: [...atual.manejos, eventoId],      // Adiciona manejos aos anteriores
        // TODO: se um manejo tiver duas vezes a mesma caracteristica, o manejo aparecerá duplicado aqui.
        calculadoEm: timestamp ?? Date.now(),
      };
    };
  }
  return canteiroManejado
}


/**
 * Monitorar um canteiro com as medidas fornecidas, retornando o canteiro modificado. O Monitoramento
 * é aplicado reinicializando os valores das características medidas, limpando eventos e manejos anteriores
 * do cálculo do Estado Atual da característica atualizada.
 * @param {object} canteiro 
 * @param {object} caracteristicasMedidas 
 * @param {string} eventoId 
 * @param {number} timestamp
 * @returns {object} monitorado
 * @returns {object} before
 * @returns {object} after
 * 
 * TODO: monitorarCanteiro deveria salvar os eventos/manejos e a diferença acumulada quando
 * há um estadoAtual anterior? Isso pode ser importante para calcular o decaimento de confiança e
 * valor de uma determinada característica.
 */
export function monitorarCanteiro({canteiro, medidas, eventoId, timestamp}) {
  const results = monitorarEstadoAtual({entidade: canteiro, medidas, eventoId, timestamp})
  // OUTRAS CONDICOES DE CANTEIROS
  return results;
}

export function calcularEvolucaoTemporalCanteiro({canteiro, catalogo, eventoId, timestamp}) {
  if (!canteiro) throw new Error ("Erro recalculando caracteristicas do canteiro: canteiro obrigatória.")
  if (!catalogo) throw new Error ("Erro recalculando caracteristicas do canteiro: catalogo obrigatório.")
  if (!eventoId) throw new Error ("Erro recalculando caracteristicas do canteiro: eventoId obrigatório.")
  if (!timestamp) throw new Error ("Erro recalculando caracteristicas do canteiro: timestamp obrigatório.")

  // Se não há condições de calcular ou entidade é morta, retorna estadoAtual Vazio
  const mutation = {estadoAtual: {}};

  if (!canteiro?.estadoAtual) {console.log (`${canteiro.id} sem estado atual`); return mutation}
  if (canteiro.isDeleted)     {console.log(`${canteiro.id} deletado`); return mutation}
  if (canteiro.isArchived)    {console.log (`${canteiro.id} arquivado`); return mutation};

  
  // para cada caracteristica presente no estado atual
  for (const caracteristicaId of Object.keys(canteiro.estadoAtual)) {
    const caracteristica = canteiro.estadoAtual[caracteristicaId];
    const caracteristicaCatalogo = catalogo.find(
      c => c.id === caracteristicaId
    );

    // Primeiro analisa se a característica tem condições de ser calculada
    if (!caracteristica) {
      console.log (`${canteiro.id} sem caracteristica ${caracteristicaId}`)
      continue;
    }
    if (!caracteristica.calculadoEm){
      console.log (`${canteiro.id} sem data de cálculo para ${caracteristicaId}`)
      continue;
    }
    if (!caracteristicaCatalogo.aplicarObsolescencia && !caracteristicaCatalogo.aplicarVariacao) {
      console.log (`Nada a fazer com ${caracteristicaId}`)
      continue
    }
    if (caracteristicaCatalogo.aplicarObsolescencia &&
      !caracteristica.confianca  && 
      !caracteristicaCatalogo.longevidade ){
      console.log(`Obsolescência inválida para ${caracteristicaId} em ${canteiro.id}`);
      continue;
    }
    if (caracteristicaCatalogo.aplicarVariacao &&
      caracteristica.valor === null &&
      !caracteristicaCatalogo.variacaoDiaria) {
      console.log(`Valor inválido para ${caracteristicaId} em ${canteiro.id}`);
      continue;
    }

    const dtMs = timestamp - caracteristica.calculadoEm;
    if (dtMs <= 0) {
      console.log(`Sem tempo mínimo decorrido para ${caracteristicaId} em ${canteiro.id}`);
      continue;
    }

    const diasDecorridos = dtMs / (1000 * 60 * 60 * 24);

    // Depois analisa se a confiança da característica varia
    let novaConfianca = caracteristica.confianca;
    if (caracteristicaCatalogo.aplicarObsolescencia) {
      
      const diasEstimados = estimarDiasDaInformacao(
        caracteristica.confianca,
        caracteristicaCatalogo.longevidade
      );
      novaConfianca = calcularConfiancaPorTempoTotal(
        diasEstimados + diasDecorridos,
        caracteristicaCatalogo.longevidade
      );
    }
    // Finalmente, analisa se o valor da característica varia
    let novoValor = caracteristica.valor;
    if (caracteristicaCatalogo.aplicarVariacao) {
      novoValor = caracteristica.valor + diasDecorridos * caracteristicaCatalogo.variacaoDiaria
    }

    // Salva a mutação
    if (novoValor !== caracteristica.valor || novaConfianca !== caracteristica.confianca) {
      mutation.estadoAtual[caracteristicaId] = {
        ...caracteristica,
        confianca: novaConfianca,
        valor: novoValor,
        calculadoEm: timestamp,
        eventos: [... (caracteristica.eventos ?? []), eventoId],
      };
    }
  }

  return mutation;
}

export function criarCanteiro({horta, estado, data = {}, }) {
  if (!horta) throw new Error ("Erro criando canteiro: horta é obrigatória.")

  // horta é obrigatória em um canteiro
  // estado {id, nome} é opcional e pode vir do data ou buscar do padrão
  const novoCanteiro = {
    ...data,
    hortaId: horta.id,
    hortaNome: horta.nome,
    estadoId: estado?.id ?? data?.estadoId,
    estadoNome: estado?.nome ?? data?.estadoNome,
  }

  return validarObjetoCanteiro(novoCanteiro)
}

export const getCaracteristicasRelevantesCanteiro = ({plantas, catalogoVariedades}) => {
  const caracteristicasSet = new Set();

  // para cada planta
  plantas.forEach(planta => {
    const variedade = catalogoVariedades.find((v) => v.id === planta.variedadeId);
    if (!variedade || !Array.isArray(variedade.ciclo)) return;

    // para cada fase do ciclo da variedade
    variedade.ciclo.forEach(fase => {
      
      // ambiente => chaves do objeto
      if (fase.ambiente && typeof fase.ambiente === "object") {
        Object.keys(fase.ambiente).forEach(id => {
          caracteristicasSet.add(id);
        });
       }

      // transicao => chaves do objeto
      // não pega para canteiros, só plantas
      // if (fase.transicao && typeof fase.transicao === "object") {
      //   Object.keys(fase.transicao).forEach(id => {
      //     caracteristicasSet.add(id);
      //   });
      // }

      // tarefas => array
      // não pega para canteiros, só plantas
      // if (Array.isArray(fase.tarefas)) {
      //   fase.tarefas.forEach(tarefa => {
      //     if (tarefa?.caracteristicaId) {
      //       caracteristicasSet.add(tarefa.caracteristicaId);
      //     }
      //   });
      // }

    });
  });

  return Array.from(caracteristicasSet);
}

export function getPendenciasCanteiro({canteiro, arrCaracteristicaIds}) {
  const pendencias = [];

  const estadoAtual = canteiro?.estadoAtual || {};

  arrCaracteristicaIds.forEach(caracteristicaId => {
    const caracteristica = estadoAtual[caracteristicaId];

    // Valor Desconhecido
    if (!caracteristica) {
      pendencias.push({
        tipoEntidadeId: ENTITY_TYPES.CANTEIRO,
        alvos: [canteiro.id],
        caracteristicaId,
        motivo: REASON_TYPES.NO_VALUE
      });
      return;
    }

    // Valor Não-Confiável
    if (typeof caracteristica.confianca !== "number" || caracteristica.confianca < 50) {
      pendencias.push({
        tipoEntidadeId: ENTITY_TYPES.CANTEIRO,
        alvos: [canteiro.id],
        caracteristicaId: caracteristicaId,
        motivo: REASON_TYPES.LOW_CONFIDENCE,
        confiancaAtual: caracteristica.confianca ?? null
      });
    }
  });

  return pendencias;
}