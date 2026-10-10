import { ENTIDADE, EVENTO, MOTIVO, RECORRENCIA } from "../types/index.js";
import { atualizarEstadoEntidade, evoluirEntidade, manejarEntidade, monitorarEntidade, movimentarEntidade, redimensionarEntidade } from "./entidade.rules.js";
import { getNecessidadeKey } from "./necessidade.rules.js";
import { getRegrasPlanta } from "./planta.rules.js";
import { mergeComValidacao } from "./rulesUtils.js";
import { criarTarefa } from "./tarefa.rules.js";

// =====
// CONSTANTES E VALIDAÇÃO
// =====
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

// =====
// REGRAS DE CRIAÇÃO DE CANTEIRO
// =====
export function criarCanteiro({ entidade }) {
  const valid = validarObjetoCanteiro(entidade);
  // OUTRAS CONDICOES DE CANTEIROS
  return valid;
}

// =====
// REGRAS DE TRANSFORMAÇÃO DE ESTADO ATUAL DE CANTEIRO
// =====
/**
 * Monitorar uma canteiro com as medidas fornecidas, retornando a canteiro modificada. O Monitoramento
 * é aplicado reinicializando os valores das características medidas, limpando eventos e manejos anteriores
 * do cálculo do Estado Atual da característica atualizada.
 * @param {object} canteiro 
 * @param {object} medidas 
 * @param {string} eventoId 
 * @param {number} timestamp
 * @returns {entidadeMonitorada, before, after}
 * 
 * TODO: monitorarCanteiro deveria salvar os eventos/manejos e a diferença acumulada quando
 * há um estadoAtual anterior? Isso pode ser importante para calcular o decaimento de confiança e
 * valor de uma determinada característica.
 * */
export function monitorarCanteiro({entidade, medidas, eventoId, timestamp}) {
  const results = monitorarEntidade({entidade, medidas, eventoId, timestamp})
  // OUTRAS CONDICOES DE CANTEIROS
  return results;
}
/**
 * Evoluir uma canteiro usando o mapa de características fornecido, retornando a canteiro modificada. 
 * @param {object} canteiro 
 * @param {object} mapaCaracteristicas 
 * @param {string} eventoId 
 * @param {number} timestamp
 * @returns {entidadeEvoluida, before, after}
 * */
export function evoluirCanteiro({entidade, mapaCaracteristicas, eventoId, timestamp}) {
  const results = evoluirEntidade({entidade, mapaCaracteristicas, eventoId, timestamp})
  // OUTRAS CONDICOES DE CANTEIROS
  return results;
}
/**
 * Manejar uma canteiro com o manejo fornecidas, retornando a canteiro modificada. O Monitoramento
 * é aplicado reinicializando os valores das características medidas, limpando eventos e manejos anteriores
 * do cálculo do Estado Atual da característica atualizada.
 * @param {object} canteiro 
 * @param {object} manejo 
 * @param {string} eventoId 
 * @param {number} timestamp
 * @returns {entidadeManejada, before, after}
 * */
export function manejarCanteiro({entidade, manejo, eventoId, timestamp}) {
  const results = manejarEntidade({entidade, manejo, eventoId, timestamp})
  // OUTRAS CONDICOES DE CANTEIROS
  return results;
}
// =====
// OUTRAS REGRAS DE TRANSFORMAÇÃO DE CANTEIRO
// =====
export function movimentarCanteiro({entidade, posicao}) {
  const results = movimentarEntidade({entidade, posicao})
  // OUTRAS CONDICOES DE CANTEIROS
  return results;
}
export function redimensionarCanteiro({entidade, dimensao, posicao}) {
  const results = redimensionarEntidade({entidade, dimensao, posicao})
  // OUTRAS CONDICOES DE CANTEIROS
  return results;
}
export function atualizarEstadoCanteiro({entidade, estado}) {
  const results = atualizarEstadoEntidade({entidade, estado})
  // OUTRAS CONDICOES DE CANTEIRO
  return results;
}

// =====
// REGRAS DE INFORMAÇÃO DE CANTEIRO
// =====
/**
 * Consolida as regras de ambiente aplicáveis a um canteiro com base
 * nas plantas presentes e suas respectivas variedades e estágios.
 *
 * A função percorre todas as plantas do canteiro e calcula a interseção
 * das faixas de ambiente (min, max, confiança) para cada característica,
 * garantindo um conjunto de condições compatíveis com todas as plantas.
 *
 * Diferente de {@link getRegrasPlanta}, esta função considera apenas
 * regras de ambiente, ignorando tarefas e transições.
 *
 * @function getRegrasCanteiro
 *
 * @param {Object} params
 * @param {Object} params.canteiro - Objeto canteiro.
 * @param {number|string} params.canteiro.id - ID do cantiero.
 *  * @param {Array<Object>} params.plantas - Lista de plantas do canteiro.
 * @param {number|string} params.plantas[].variedadeId - ID da variedade da planta.
 * @param {number} params.plantas[].estagioIndex - Índice do estágio atual no ciclo.
 *
 * @param {Map<number|string, Variedade>} params.mapaVariedades - Mapa de variedades indexado por ID.
 *
 * @returns {{ [caracteristicaId: string]: FaixaAmbiente }}
 * Mapa de faixas de ambiente consolidadas por caracteristicaId, no formato:
 * {
 *   caracteristicaId: {
 *     min: number,
 *     max: number,
 *     confianca: number
 *   }
 * }
 *
 * A consolidação é feita por:
 * - min: maior valor mínimo entre as plantas (interseção inferior)
 * - max: menor valor máximo entre as plantas (interseção superior)
 * - confianca: menor nível de confiança entre as plantas
 *
 * Retorna objeto vazio ({}) caso não haja plantas válidas ou regras aplicáveis.
 *
 * @typedef {Object} FaixaAmbiente
 * @property {number} min - Limite inferior da faixa consolidada.
 * @property {number} max - Limite superior da faixa consolidada.
 * @property {number} confianca - Nível de confiança da faixa consolidada.
 */
export const getRegrasCanteiro = ({canteiro, plantas, mapaVariedades}) => {
  const mapaRegras = {};

  // para cada planta
  plantas.forEach(planta => {
    if (planta.canteiroId !== canteiro.id) return;

    const regrasPlanta = getRegrasPlanta({planta, mapaVariedades})
    // Para cada regra
    Object.entries(regrasPlanta).forEach(([caracteristicaId,regras])=>{
      if (!mapaRegras[caracteristicaId]) {
        mapaRegras[caracteristicaId] = {...regras.ambiente};
      }
      else { // interseção das faixas
        mapaRegras[caracteristicaId].min =
          Math.max(mapaRegras[caracteristicaId].ambiente.min, regras.ambiente.min)
        mapaRegras[caracteristicaId].max =
          Math.min(mapaRegras[caracteristicaId].ambiente.max, regras.ambiente.max)
        mapaRegras[caracteristicaId].confianca =
          Math.min(mapaRegras[caracteristicaId].ambiente.confianca, regras.ambiente.confianca)
      }
    })
  });

  return mapaRegras;
}
// ** UNDER REVIEW **
export function getPendenciasCanteiro({canteiro, mapaRegras}) {
  const pendencias = [];

  Object.entries(mapaRegras).forEach(([caracteristicaId, regra]) => {
    const estadoAtual = canteiro.estadoAtual?.[caracteristicaId];
    // Valor Desconhecido
    if (!estadoAtual || typeof estadoAtual.valor !== "number") {
      pendencias.push({
        tipoEventoId: EVENTO.MONITORAMENTO.id,
        tipoEntidadeId: ENTIDADE.canteiro.id,
        caracteristicaId,
        motivo: MOTIVO.SEM_DADOS.id
      });
      return;
    }

    // Valor Não-Confiável
    if (typeof estadoAtual.confianca !== "number"
     || estadoAtual.confianca < (regra.ambiente.confianca
     || 30)) {
      pendencias.push({
        tipoEventoId: EVENTO.MONITORAMENTO.id,
        tipoEntidadeId: ENTIDADE.canteiro.id,
        caracteristicaId,
        motivo: MOTIVO.BAIXA_CONFIANCA.id,
        confianca: estadoAtual.confianca ?? null
      });
      return;
    }

    // Valor Abaixo do ideal
    if (estadoAtual.valor < regra.ambiente.min) {
      pendencias.push({
        tipoEventoId: EVENTO.MANEJO.id,
        tipoEntidadeId: ENTIDADE.canteiro.id,
        caracteristicaId,
        motivo: MOTIVO.CARENCIA.id,
        valor: estadoAtual.valor
      });
      return;
    }

    // Valor Acima do ideal
    if (estadoAtual.valor > regra.ambine.max) {
      pendencias.push({
        tipoEventoId: EVENTO.MANEJO.id,
        tipoEntidadeId: ENTIDADE.canteiro.id,
        caracteristicaId,
        motivo: MOTIVO.EXCESSO.id,
        valor: estadoAtual.valor
      });
      return;
    }
  });
  
  return pendencias;
}
// ** UNDER REVIEW **
export const getNecessidadesCanteiro = ({
  canteiro,
  plantas,
  timestamp,
  contexto, // {mapaTarefas}
  mapaNecessidades,
  mapaVariedades,
  mapaCaracteristicas }) => {
  const entidadeId = canteiro.id
  const entidadeNome = canteiro.nome
  
  // Obtem as pendências (necessidades candidatas)
  const plantasArr = plantas.filter((p)=> p.canteiroId === entidadeId)
  const mapaRegras = getRegrasCanteiro({plantas: plantasArr, mapaVariedades})
  const pendencias = getPendenciasCanteiro({canteiro, mapaRegras});
  const necessidades = [];

  // TODO: Todo o resto desta função é compartilhado entre planta e canteiro
  // Verifica cada pendência, para saber se a necessidade já está ativa
  // As pendências com necessidade ativa não geram tarefas
  for (const pendencia of pendencias) {
    const caracteristicaId = pendencia.caracteristicaId
    const necessidadeId = getNecessidadeKey({
      entidadeId,
      caracteristicaId,
      tipoEventoId: pendencia.tipoEventoId
    });
    const ativa = mapaNecessidades.get(necessidadeId)?.ativo;
    if (ativa) continue;

    // Se houver contexto, atualiza o mapa de tarefas do contexto
    // Se o contexto já tiver tarefa para a característica, adiciona a entidade
    // se não tiver tarefa para a caractertística, cria a tarefa
    if (contexto?.mapaTarefas) {
      const tarefa = contexto.mapaTarefas[caracteristicaId];
      if (tarefa) {
        if (!tarefa.contexto.entidadesId.includes(entidadeId)) {
          tarefa.descricao += `, ${entidadeNome}`;
          tarefa.contexto.entidadesId.push(entidadeId);
        }
      }
      else {
        // Monta contexto da tarefa
        const caracteristica = mapaCaracteristicas.get(caracteristicaId);
        const contextoTarefa = {
          tipoEventoId: pendencia.tipoEventoId,
          tipoEntidadeId: pendencia.tipoEntidadeId,
          caracteristicaId: pendencia.caracteristicaId,
          entidadesId: [entidadeId],
        };
        // Monta dados da tarefa
        let acao = EVENTO[pendencia.tipoEventoId]?.acao ?? "-"
        const dados = {
          nome: `${acao} ${caracteristica.nome}`,
          descricao: `${caracteristica.descricao} Plantas: ${entidadeNome}`
        }
        contexto.mapaTarefas[caracteristicaId] = criarTarefa({
          contexto: contextoTarefa,
          planejamento: {
            recorrencia: RECORRENCIA.NENHUMA.id,
            vencimento: timestamp,
            prioridade: 1
          },
          dados,
        })
      }
    }

    // Monta a necessidade //TODO criarNecessidade em necessidades.rules
    const necessidadeDesvinculada = {
      ativo: true,  
      entidadeId,
      caracteristicaId,
      tipoEventoId: pendencia.tipoEventoId,
      estadoAtual: pendencia.estadoAtual ?? {},
      motivo: pendencia.motivo,
    }

    //Armazena no returnArr
    necessidades.push(necessidadeDesvinculada)

    //Atualiza o mapa local para evitar duplicação
    mapaNecessidades.set(necessidadeId, necessidadeDesvinculada);
  };
  return necessidades
}