import { REASON_TYPES, ENTITY_TYPES, EVENTO_TYPES } from "../types/index.js";
import { monitorarEntidade } from "./entidade.rules.js";
import { getNecessidadeId } from "./necessidade.rules.js";
import { estimarDiasDaInformacao, calcularConfiancaPorTempoTotal,  mergeComValidacao } from "./rulesUtils.js";
import { criarTarefa } from "./tarefa.rules.js";

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
  
/**
 * Aplica um manejo já registrado em uma planta, retornando a planta modificada.
 * @param {planta} planta - entidade da planta a ser manejado
 * @param {manejo} manejo - entidade do manejo a ser aplicado
 * @param {string} eventoId - id do evento associado ao manejo
 * @param {number} timestamp - timestamp do manejo
 * @returns {planta} entidadeManejada
 * @returns {Object} before
 * @returns {Object} after
 */
export function manejarPlanta({planta, manejo, eventoId, timestamp}) {
  const results = monitorarEntidade({entidade: planta, manejo, eventoId, timestamp})
  // OUTRAS CONDICOES DE PLANTAS
  return results;
}

/**
 * Monitorar uma planta com as medidas fornecidas, retornando a planta modificada. O Monitoramento
 * é aplicado reinicializando os valores das características medidas, limpando eventos e manejos anteriores
 * do cálculo do Estado Atual da característica atualizada.
 * @param {object} planta 
 * @param {object} medidas 
 * @param {string} eventoId 
 * @param {number} timestamp
 * @returns {object} canteiroMonitorado
 * 
 * TODO: monitorarPlanta deveria salvar os eventos/manejos e a diferença acumulada quando
 * há um estadoAtual anterior? Isso pode ser importante para calcular o decaimento de confiança e
 * valor de uma determinada característica.
 * */
export function monitorarPlanta({planta, medidas, eventoId, timestamp}) {
  const results = monitorarEntidade({entidade: planta, medidas, eventoId, timestamp})
  // OUTRAS CONDICOES DE PLANTAS
  return results;
}

export function evoluirCaracteristicas({entidade, mapaCaracteristicas, eventoId, timestamp}) {
  if (!entidade) throw new Error ("Erro evoluindo entidade: planta obrigatória.")
  if (!mapaCaracteristicas) throw new Error ("Erro evoluindo entidade: catalogoCaracteristicas obrigatório no contexto.")
  if (!eventoId) throw new Error ("Erro evoluindo entidade: eventoId obrigatório.")
  if (!timestamp) throw new Error ("Erro evoluindo entidade: timestamp obrigatório.")

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
    if (!caracteristica.aplicarObsolescencia && !caracteristica.aplicarVariacao) return false;
    if (caracteristica.aplicarObsolescencia) {
      if (!estado.confianca && !caracteristica.longevidade) {
        throw new Error(`${caracteristica.nome} com obsolescência inválida!`);
      }
    }
    if (caracteristica.aplicarVariacao) {
      if (estado.valor === null && !caracteristica.variacaoDiaria){
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
      if (caracteristica.aplicarObsolescencia) {
        const diasEstimados = estimarDiasDaInformacao(
          estado.confianca,
          caracteristica.longevidade
        );
        novaConfianca = calcularConfiancaPorTempoTotal(
          diasEstimados + diasDecorridos,
          caracteristica.longevidade
        );
      }

      // Calcula novo valor da característica
      let novoValor = estado.valor;
      if (caracteristica.aplicarVariacao) {
        novoValor = estado.valor + diasDecorridos * caracteristica.variacaoDiaria
      }

      // Processa a mutação
      if (novoValor !== estado.valor || novaConfianca !== estado.confianca) {
        before[caracteristicaId] = estado
        after[caracteristicaId] = {
          ...estado,
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

  return {entidadeEvoluida, before, after};
}

export function plantarVariedade({especie, variedade, tecnica, canteiro, posicao}) {
  if (!especie) throw new Error ("Erro plantando variedade: especie obrigatório.")
  if (!variedade) throw new Error ("Erro plantando variedade: variedade obrigatório.")
  if (!tecnica) throw new Error ("Erro plantando variedade: tecnica obrigatório.")
  if (!canteiro) throw new Error ("Erro plantando variedade: canteiro obrigatório.")
  if (!posicao) throw new Error ("Erro plantando variedade: posicao obrigatória.")
  if (!variedade?.ciclo?.find(est => est.estagioId === tecnica.estagioId)?.dimensao)
    throw new Error (`Variedade ${variedade.nome} não possui dimensão no estágio ${tecnica.estagioNome}.`)

  
  const novaPlanta = {
    aparencia: variedade.aparencia,
    canteiroId: canteiro.id,
    canteiroNome: canteiro.nome,
    dimensao: variedade?.ciclo?.find(est => est.estagioId === tecnica.estagioId)?.dimensao,// ?? {x:1,y:1,z:0},
    especieId: especie.id,
    especieNome: especie.nome,
    estadoId: estadoInicial.id,
    estadoNome: estadoInicial.nome,
    estagioId: tecnica.estagioId,
    estagioNome: tecnica.estagioNome,
    hortaId: canteiro.hortaId,
    hortaNome: canteiro.hortaNome,
    nome: "Nova planta",
    posicao: {
      x: Math.round(posicao.x) || 0,
      y: Math.round(posicao.y) || 0,
      z: Math.round(posicao.z) || 0,
    },
    variedadeId: variedade.id,
    variedadeNome: variedade.nome,
  }
  return novaPlanta
}


export function validarPlanta(dataObj) {
    const valid = mergeComValidacao(plantaPadrao, dataObj);
    return valid;
}

//TODO: ISSO É REFERENTE À VARIEDADE, NÃO À PLANTA
export function validarCiclo(dataObj) {
    const valid = mergeComValidacao(cicloPadrao, dataObj);
    return valid;
}

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
    const necessidadeId = getNecessidadeId({entidadeId, caracteristicaId, tipoEventoId})
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
