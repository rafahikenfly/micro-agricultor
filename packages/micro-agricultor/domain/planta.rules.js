import { REASON_TYPES, EVENTO_TYPES, ENTIDADE, EVENTO, RECORRENCIA } from "../types/index.js";
import { evoluirEntidade, manejarEntidade, monitorarEntidade, movimentarEntidade, redimensionarEntidade, } from "./entidade.rules.js";
import { getNecessidadeKey } from "./necessidade.rules.js";
import { mergeComValidacao } from "./rulesUtils.js";
import { criarTarefa } from "./tarefa.rules.js";

// =====
// CONSTANTES E VALIDAÇÃO
// =====
const estadoInicial = {
  id: "HLRvq5eExZAiKSZOcnaF",
  nome: "Prevista",
}
const aparenciaPadrao = {
    fundo: "#4CAF50",
    borda: "#1B5E20",
    espessura: 2,
    geometria: "circle",
    vertices: [],
};
const plantaPadrao = {
    aparencia: aparenciaPadrao,
    ciclo: [
//    cicloPadrao      
    ],
    descricao: "",
    dimensao: { x: 1, y: 1, z: 0 },
    posicao: { x: 0, y: 0, z: 0 },
    estadoAtual: {},
    estadoId: "",
    estadoNome: "",
    estagioId: "",
    estagioNome: "",
    canteiroId: "",
    canteiroNome: "",
    hortaId: "",
    hortaNome: "",
    nome: "Nova planta",
    especieId: "",
    especieNome: "",
    variedadeId: "",
    variedadeNome: "",
}
const cicloPadrao = {
  estagioId: "",
  estagioNome: "",
  dimensao: {x: 0, y: 0, z: 0},
  ambiente: {
      //    [caracteristicaId]: { min: 6, max: 10 },
  },
  tarefas: [
//    { caracteristicaId: $caracteristicaId,
//      operador: ">=",
//      limite: 4,
//      manejos: [
//        { ...manejoId: $manejoId, manejoNome: $manejoNome },
//        ...
//      ]
//    }
    ],
  transicao: {
//    { caracteristicaId: $caracteristicaId,
//      operador: ">=",
//      limite: 4, }
//      ...
    },
};
export function validarPlanta(dataObj) {
  const valid = mergeComValidacao(plantaPadrao, dataObj);
  return valid;
}
// ** UNDER REVIEW ** ISSO É REFERENTE À VARIEDADE, NÃO À PLANTA
export function validarCiclo(dataObj) {
    const valid = mergeComValidacao(cicloPadrao, dataObj);
    return valid;
}


  
// =====
// REGRAS DE CRIAÇÃO DE PLANTA
// =====
export function criarPlanta({ entidade }) {
  const valid = validarPlanta(entidade);
  // OUTRAS CONDICOES DE PLANTA
  return valid;
}
export function derivarPlanta({especie, variedade, tecnica, canteiro, posicao}) {
  if (!especie) throw new Error ("derivarPlanta: especie obrigatório.")
  if (!variedade) throw new Error ("derivarPlanta: variedade obrigatório.")
  if (!tecnica) throw new Error ("derivarPlanta: tecnica obrigatório.")
  if (!canteiro) throw new Error ("derivarPlanta: canteiro obrigatório.")
  if (!posicao) throw new Error ("derivarPlanta: posicao obrigatório.")
  const estagio = variedade?.ciclo?.find(
    est => est.estagioId === tecnica.estagioId
  );

  if (!estagio?.dimensao) {
    throw new Error(
      `derivarPlanta: Variedade ${variedade.nome} não possui dimensão no estágio ${tecnica.estagioNome}.`
    );
  }

  const plantaDerivada = {
    aparencia: variedade.aparencia,
    canteiroId: canteiro.id,
    canteiroNome: canteiro.nome,
    dimensao: {
      x: estagio.dimensao.x ?? 1,
      y: estagio.dimensao.y ?? 1,
      z: estagio.dimensao.z ?? 1,
    },
    especieId: especie.id,
    especieNome: especie.nome,
    estadoId: estadoInicial.id,
    estadoNome: estadoInicial.nome,
    estagioId: tecnica.estagioId,
    estagioNome: tecnica.estagioNome,
    hortaId: canteiro.hortaId,
    hortaNome: canteiro.hortaNome,
    nome: `${variedade.nome} • ${posicao.coordenada} • ${canteiro.nome}`,
    variedadeId: variedade.id,
    variedadeNome: variedade.nome,
    posicao: {
      x: posicao.x ?? 0,
      y: posicao.y ?? 0,
      z: posicao.z ?? 0,
    }
  }

  const entidade = criarPlanta({entidade: plantaDerivada})
  return { entidade, operacao: "CREATE"}
}

// =====
// REGRAS DE TRANSFORMAÇÃO DE ESTADO ATUAL DE PLANTA
// =====
/**
 * Monitorar uma planta com as medidas fornecidas, retornando a planta modificada. O Monitoramento
 * é aplicado reinicializando os valores das características medidas, limpando eventos e manejos anteriores
 * do cálculo do Estado Atual da característica atualizada.
 * @param {object} planta 
 * @param {object} medidas 
 * @param {string} eventoId 
 * @param {number} timestamp
 * @returns {entidadeMonitorada, before, after}
 * 
 * TODO: monitorarPlanta deveria salvar os eventos/manejos e a diferença acumulada quando
 * há um estadoAtual anterior? Isso pode ser importante para calcular o decaimento de confiança e
 * valor de uma determinada característica.
 * */
export function monitorarPlanta({entidade, medidas, eventoId, timestamp}) {
  const results = monitorarEntidade({entidade, medidas, eventoId, timestamp})
  // OUTRAS CONDICOES DE PLANTAS
  return results;
}
/**
 * Evoluir uma planta usando o mapa de características fornecido, retornando a planta modificada. 
 * @param {object} planta 
 * @param {object} mapaCaracteristicas 
 * @param {string} eventoId 
 * @param {number} timestamp
 * @returns {entidadeEvoluida, before, after}
 * */
export function evoluirPlanta({entidade, mapaCaracteristicas, eventoId, timestamp}) {
  const results = evoluirEntidade({entidade, mapaCaracteristicas, eventoId, timestamp})
  // OUTRAS CONDICOES DE PLANTAS
  return results;
}
/**
 * Manejar uma planta com o manejo fornecidas, retornando a planta modificada. O Monitoramento
 * é aplicado reinicializando os valores das características medidas, limpando eventos e manejos anteriores
 * do cálculo do Estado Atual da característica atualizada.
 * @param {object} planta 
 * @param {object} manejo 
 * @param {string} eventoId 
 * @param {number} timestamp
 * @returns {entidadeManejada, before, after}
 * */
export function manejarPlanta({entidade, manejo, eventoId, timestamp}) {
  const results = manejarEntidade({entidade, manejo, eventoId, timestamp})
  // OUTRAS CONDICOES DE PLANTAS
  return results;
}

// =====
// OUTRAS REGRAS DE TRANSFORMAÇÃO DE PLANTAS
// =====
export function desenharPlanta({entidade, posicao}) {
  const results = movimentarEntidade({entidade, posicao})
  // OUTRAS CONDICOES DE PLANTA
  return results;
}
export function redimensionarPlanta({entidade, dimensao, posicao}) {
  const results = redimensionarEntidade({entidade, dimensao, posicao})
  // OUTRAS CONDICOES DE PLANTA
  return results;
}
// ** UNDER REVIEW **
export function mudarVariedade(planta, novaVariedade) {
    return {
      ...planta,
  
      // identidade botânica
      especieId: novaVariedade.especieId,
      especieNome: novaVariedade.especieNome,
      variedadeId: novaVariedade.id,
      variedadeNome: novaVariedade.nome,
  
      // aparência
      aparencia: {
        borda: novaVariedade.aparencia.borda,
        espessura: novaVariedade.aparencia.espessura,
        fundo: novaVariedade.aparencia.fundo,
        elipse: novaVariedade.aparencia.elipse,
        vertices: novaVariedade.aparencia.vertices,
      },
  
    };
}

// =====
// REGRAS DE INFORMAÇÃO DE PLANTA
// =====
// ** UNDER REVIEW **
export const getCaracteristicasRelevantesPlanta = ({planta, mapaVariedades}) => {
  const caracteristicasSet = new Set();

  // para cada planta
  const variedade = mapaVariedades.get(planta.variedadeId);
  if (!variedade || !Array.isArray(variedade.ciclo)) return;

  // para cada fase do ciclo da variedade
  variedade.ciclo.forEach(fase => {
    
    // ambiente => chaves do objeto
    // não pega para as plantas, só para os canteiros
    //if (fase.ambiente && typeof fase.ambiente === "object") {
    //  Object.keys(fase.ambiente).forEach(id => {
    //    caracteristicasSet.add(id);
    //  });
    //}

    // transicao => chaves do objeto
    if (fase.transicao && typeof fase.transicao === "object") {
      Object.keys(fase.transicao).forEach(id => {
        caracteristicasSet.add(id);
      });
    }

    // tarefas => array
    if (Array.isArray(fase.tarefas)) {
      fase.tarefas.forEach(tarefa => {
        if (tarefa?.caracteristicaId) {
          caracteristicasSet.add(tarefa.caracteristicaId);
        }
      });
    }

  });

  return Array.from(caracteristicasSet);
}
// ** UNDER REVIEW **
export function getPendenciasPlanta({planta, arrCaracteristicaIds}) {
  const pendencias = [];

  const estadoAtual = planta?.estadoAtual || {};

  arrCaracteristicaIds.forEach(caracteristicaId => {
    const caracteristica = estadoAtual[caracteristicaId];

    // Valor Desconhecido
    if (!caracteristica) {
      pendencias.push({
        tipoEventoId: EVENTO.MONITORAMENTO.id,
        tipoEntidadeId: ENTIDADE.planta.id,
        caracteristicaId,
        motivo: REASON_TYPES.NO_VALUE,
      });
      return;
    }

    // Valor Não-Confiável
    if (typeof caracteristica.confianca !== "number" || caracteristica.confianca < 50) {
      pendencias.push({
        tipoEventoId: EVENTO.MONITORAMENTO.id,
        tipoEntidadeId: ENTIDADE.planta.id,
        caracteristicaId,
        motivo: REASON_TYPES.LOW_CONFIDENCE,
        confianca: caracteristica.confianca ?? null
      });
    }
  });

  return pendencias;
}

/**
 * Avalia uma planta e gera necessidades de monitoramento com base em pendências identificadas.
 * A função também pode, opcionalmente, atualizar um mapa de tarefas compartilhado (via `contexto.mapaTarefas`),
 * agregando tarefas por `caracteristicaId`.
 *
 * ⚠️ Efeitos colaterais:
 * - Atualiza `mapaNecessidades` (Map) com novas necessidades para evitar duplicações no mesmo ciclo.
 * - Pode mutar `contexto.mapaTarefas` caso fornecido.
 *
 * @param {Object} params
 * @param {Object} params.planta - Entidade planta a ser avaliada.
 * @param {string} params.planta.id - Identificador da planta.
 * @param {string} params.planta.nome - Nome da planta.
 * @param {number} params.timestamp - Timestamp atual (usado para planejamento da tarefa).
 * @param {Object} [params.contexto] - Contexto opcional para agregação de tarefas.
 * @param {Object.<string, Object>} [params.contexto.mapaTarefas] 
 *   Mapa de tarefas indexado por `caracteristicaId`. ⚠️ Será mutado caso fornecido.
 * @param {Map<string, Object>} params.mapaNecessidades 
 *   Mapa de necessidades já existentes (key = necessidadeId).
 *   Usado para evitar recriação de necessidades já ativas.
 *   ⚠️ Será mutado com novas necessidades durante a execução.
 * @param {Map<string, Object>} params.mapaVariedades 
 *   Mapa de variedades (catálogo), usado para determinar características relevantes da planta.
 * @param {Map<string, Object>} params.mapaCaracteristicas 
 *   Mapa de características, utilizado para enriquecer dados de tarefas (nome/descrição).
 * @returns {Array<Object>} necessidades
 *   Lista de necessidades geradas (não persistidas), no formato:
 *   @property {boolean} ativo - Indica que a necessidade está ativa.
 *   @property {string} entidadeId - ID da planta.
 *   @property {string} caracteristicaId - ID da característica associada.
 *   @property {string} tipoEventoId - Tipo de evento (ex: MONITOR).
 *   @property {Object} estadoAtual - Estado atual observado.
 *   @property {string} motivo - Motivo da necessidade.
 *
 * @example
 * const necessidades = getNecessidadesPlanta({
 *   planta,
 *   timestamp: Date.now(),
 *   contexto: { mapaTarefas },
 *   mapaNecessidades,
 *   mapaVariedades,
 *   mapaCaracteristicas
 * });
 *
 * @example
 * // Uso sem geração de tarefas (somente necessidades)
 * const necessidades = getNecessidadesPlanta({
 *   planta,
 *   timestamp,
 *   mapaNecessidades,
 *   mapaVariedades,
 *   mapaCaracteristicas
 * });
 */
export const getNecessidadesPlanta = ({
  planta,
  timestamp,
  contexto, // {mapaTarefas}
  mapaNecessidades,
  mapaVariedades,
  mapaCaracteristicas}) => {
  const entidadeId = planta.id
  const entidadeNome = planta.nome
  
  // Obtem as pendências (necessidades candidatas)
  const arrCaracteristicaIds = getCaracteristicasRelevantesPlanta({planta, mapaVariedades})
  const pendencias = getPendenciasPlanta({planta, arrCaracteristicaIds});
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
        let acao = ""
        if (pendencia.tipoEventoId === EVENTO_TYPES.MONITOR) acao = "Monitorar" //TODO: Isso pode ir para EVENTO_TYPES
        if (pendencia.tipoEventoId === EVENTO_TYPES.HANDLE) acao = "Manejar"
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