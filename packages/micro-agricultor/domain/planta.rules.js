import { REASON_TYPES, ENTITY_TYPES, EVENTO_TYPES } from "../types/index.js";
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
export const getCaracteristicasRelevantesPlanta = ({planta, catalogoVariedades}) => {
  const caracteristicasSet = new Set();

  // para cada planta
  const variedade = catalogoVariedades.find((v) => v.id === planta.variedadeId);
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
        tipoEntidadeId: ENTITY_TYPES.PLANTA,
        alvos: [planta.id],
        caracteristicaId,
        motivo: REASON_TYPES.NO_VALUE,
      });
      return;
    }

    // Valor Não-Confiável
    if (typeof caracteristica.confianca !== "number" || caracteristica.confianca < 50) {
      pendencias.push({
        tipoEntidadeId: ENTITY_TYPES.PLANTA,
        alvos: [planta.id],
        caracteristicaId: caracteristicaId,
        motivo: REASON_TYPES.LOW_CONFIDENCE,
        confiancaAtual: caracteristica.confianca ?? null
      });
    }
  });

  return pendencias;
}
// ** UNDER REVIEW **
export const getNecessidadesPlanta = ({
  planta,
  timestamp,
  mapaTarefas,
  mapaNecessidades,
  catalogoVariedades,
  caracteristicasMap}) => {
  const entidadeId = planta.id
  
  // =====
  // Monitoramento
  // =====
  const tipoEventoId = EVENTO_TYPES.MONITOR
  
  // Obtem as pendências (necessidades candidatas)
  const arrCaracteristicaIds = getCaracteristicasRelevantesPlanta({planta, catalogoVariedades})
  const pendencias = getPendenciasPlanta({planta, arrCaracteristicaIds});
  console.log(`${pendencias.length} pendências para ${planta.id}`);
  const necessidades = [];
  
  // TODO: Todo o resto desta função é compartilhado entre planta e canteiro
  // É uma situação muito parecida com o registro do monitoramento, que tem uma regra compartilhada.
  // provavelmente isso aqui vai acabar indo para monitoramento.rules
  // Verifica cada pendência se já está ativa
  for (const pendencia of pendencias) {
    const caracteristicaId = pendencia.caracteristicaId
    const necessidadeId = getNecessidadeKey({entidadeId, caracteristicaId, tipoEventoId})
    if (!mapaNecessidades?.[necessidadeId]?.ativo) {
      // recupera a característica para construir o nome e descrição
      const caracteristica = caracteristicasMap.get(caracteristicaId);
      
      // Monta contexto da tarefa
      const contexto = {
        tipoEventoId,
        tipoEntidadeId: pendencia.tipoEntidadeId,
        caracteristicaId: pendencia.caracteristicaId,
        entidadesId: [entidadeId],
      }

      // Atualiza o mapa de tarefas
      if (!mapaTarefas[caracteristicaId]) {
        const dados = {
          nome: `Monitorar ${caracteristica.nome}`,
          descricao: `${caracteristica.descricao} Plantas: ${planta.nome}`
        }
        mapaTarefas[caracteristicaId] = criarTarefa({
          contexto,
          planejamento: {
            recorrencia: RECURRING_TYPES.NONE,
            vencimento: timestamp,
            prioridade: 1
          },
          dados,
        })
      }
      else {
        mapaTarefas[caracteristicaId].descricao += `, ${planta.nome}`
        mapaTarefas[caracteristicaId].contexto.entidadesId.push(entidadeId)
      }

      // Monta a necessidade //TODO criarNecessidade em necessidades.rules
      const necessidadeDesvinculada = {
        ativo: true,  
        entidadeId,
        caracteristicaId,
        tipoEventoId,
        estadoAtual: pendencia.estadoAtual ?? {},
        motivo: pendencia.motivo,
      }

      //Armazena no returnArr
      necessidades.push(necessidadeDesvinculada)

      //Atualiza localmente
      mapaNecessidades[necessidadeId] = necessidadeDesvinculada;

    }
  }
  return necessidades
}