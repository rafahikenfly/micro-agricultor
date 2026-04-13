import { ENTIDADE } from "../types/ENTITY_TYPES.js";
import { EVENTO, EVENTO_TYPES } from "../types/EVENTO.js";
import { REASON_TYPES } from "../types/REASON_TYPES.js";
import { RECORRENCIA } from "../types/RECORRENCIA.js";
import { evoluirEntidade, manejarEntidade, monitorarEntidade, movimentarEntidade, redimensionarEntidade } from "./entidade.rules.js";
import { getNecessidadeKey } from "./necessidade.rules.js";
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

// =====
// REGRAS DE INFORMAÇÃO DE CANTEIRO
// =====
// ** UNDER REVIEW **
export const getCaracteristicasRelevantesCanteiro = ({plantas, mapaVariedades}) => {
  //const caracteristicasSet = new Set();
  const caracteristicasRelevantes = {};

  // para cada planta
  plantas.forEach(planta => {
    const variedade = mapaVariedades.get(planta.variedadeId);
    if (!variedade || !Array.isArray(variedade.ciclo)) return;

    // para cada fase do ciclo da variedade
    variedade.ciclo.forEach(fase => {
      
      // ambiente => chaves do objeto
      if (fase.ambiente && typeof fase.ambiente === "object") {
        /* Apenas IDs
        Object.keys(fase.ambiente).forEach(id => {
          caracteristicasSet.add(id);
        });
        */
        Object.entries(fase.ambiente).forEach(([caracteristicaId, faixa]) => {
          if (!caracteristicasRelevantes[caracteristicaId]) {
            caracteristicasRelevantes[caracteristicaId] = { ...faixa }
          } else {
            // interseção das faixas
            caracteristicasRelevantes[caracteristicaId].min =
              Math.max(caracteristicasRelevantes[caracteristicaId].min, faixa.min)

            caracteristicasRelevantes[caracteristicaId].max =
              Math.min(caracteristicasRelevantes[caracteristicaId].max, faixa.max)
          }
        })
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

  return caracteristicasRelevantes;
  //return Array.from(caracteristicasSet);
}
/**
 * Retorna as pendências de um canteiro.
 * A diferença entre uma pendência e uma necessidade é apenas que ela não tem um
 * tipoEventoId e um array de entidades associado.
 * @param {object} params
 * @param {canteiro} canteiro
 * @param {array} arrCaracteristicaIds
 * @param {object} faixaIdeal {[caracteristicaId]: {min, max}}
 * @returns [ {tipoEntidadeId, alvos, caracteristicaId, motivo} ]
 */
// ** UNDER REVIEW **
export function getPendenciasCanteiro({canteiro, mapaCaracteristicas}) {
  const pendencias = [];

  const estadoAtual = canteiro?.estadoAtual || {};
  Object.entries(mapaCaracteristicas).forEach(([caracteristicaId, faixaIdeal]) => {
    const caracteristica = estadoAtual[caracteristicaId];

    // Valor Desconhecido
    if (!caracteristica || typeof caracteristica.valor !== "number") {
      pendencias.push({
        tipoEventoId: EVENTO.MONITORAMENTO.id,
        tipoEntidadeId: ENTIDADE.canteiro.id,
        caracteristicaId,
        motivo: REASON_TYPES.NO_VALUE
      });
      return;
    }

    // Valor Não-Confiável
    if (typeof caracteristica.confianca !== "number" || caracteristica.confianca < 30) { //TODO: vir de alguma configuracao
      pendencias.push({
        tipoEventoId: EVENTO.MONITORAMENTO.id,
        tipoEntidadeId: ENTIDADE.canteiro.id,
        caracteristicaId,
        motivo: REASON_TYPES.LOW_CONFIDENCE,
        confianca: caracteristica.confianca
      });
      return;
    }

    // Valor Abaixo do ideal
    if (caracteristica.valor < faixaIdeal.min) {
      pendencias.push({
        tipoEventoId: EVENTO.MANEJO.id,
        tipoEntidadeId: ENTIDADE.canteiro.id,
        caracteristicaId,
        motivo: REASON_TYPES.LOWER_BOUND,
        valor: caracteristica.valor
      });
      return;
    }

    // Valor Acima do ideal
    if (caracteristica.valor > faixaIdeal.max) {
      pendencias.push({
        tipoEventoId: EVENTO.MANEJO.id,
        tipoEntidadeId: ENTIDADE.canteiro.id,
        caracteristicaId,
        motivo: REASON_TYPES.UPPER_BOUND,
        valor: caracteristica.valor
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
  const arrCaracteristicaIds = getCaracteristicasRelevantesCanteiro({plantas: plantasArr, mapaVariedades})
  const pendencias = getPendenciasCanteiro({canteiro, mapaCaracteristicas: arrCaracteristicaIds});
  console.log(`${pendencias.length} pendências para ${entidadeId}`);
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
         // TODO: por que o motivo da pendência não veio pra cá?
          tipoEventoId: pendencia.tipoEventoId,
          tipoEntidadeId: pendencia.tipoEntidadeId,
          caracteristicaId: pendencia.caracteristicaId,
          entidadesId: [entidadeId],
        };
        // Monta dados da tarefa
        let acao = ""
        if (pendencia.tipoEventoId === EVENTO_TYPES.MONITOR) acao = "Monitorar" //TODO: Isso pode ir para EVENTO_TYPES
        if (pendencia.tipoEventoId === EVENTO_TYPES.HANDLE) acao = "Manejar"
        const dados = {
          nome: `${acao} ${caracteristica.nome}`,
          descricao: `${caracteristica.descricao} Canteiros: ${entidadeNome}`
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