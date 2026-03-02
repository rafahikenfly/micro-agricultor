//FUNCTIONS COPY
import { ENTITY_TYPES } from "../types/ENTITY_TYPES.js";
import { REASON_TYPES } from "../types/REASON_TYPES.js";
import { estimarDiasDaInformacao, calcularConfiancaPorTempoTotal,  mergeComValidacao } from "./rulesUtils.js";

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
  
//TODO: ARRUMAR ESSA FUNÇÃO
export function manejarPlanta(planta, manejo, eventoId, ts) {
  // Cria uma cópia da planta para não modificar o original, garantindo a existencia da chave estadoAtual
  const plantaManejada = {
    ...planta,
    estadoAtual: {
      ...(planta.estadoAtual ?? {}),
    },
  };
  const relatorioEfeitos = {};

  // Atualiza o estado de destino da planta conforme o manejo
  if (manejo.estadoDestinoId) {
    plantaManejada.estadoId = manejo.estadoDestinoId;
    plantaManejada.estadoNome = manejo.estadoDestinoNome;
  }

  // Processa os efeitos do manejo
  if (Array.isArray(manejo.efeitos)) {
    manejo.efeitos.forEach((ef) => {
      // Garante que a característica exista no estadoAtual
      const atual =
        plantaManejada.estadoAtual[ef.caracteristicaId] ?? {
          valor: 0,
          confianca: 0,
          eventos: [],
          manejos: [],
        };

      // Salva os valores antes do efeito
      const valorAntes = atual.valor ?? 0;
      const confiancaAntes = atual.confianca ?? 0;

      let valorDepois = valorAntes;
      let confiancaDepois = confiancaAntes;

      // Aplica o efeito conforme o tipo
      switch (ef.tipoEfeitoId) {
        case "delta": valorDepois += Number(ef.valorEfeito);
          break;
        case "multiplicador":  valorDepois *= Number(ef.valorEfeito);
          break;
        case "fixo": valorDepois = Number(ef.valorEfeito);
          break;
        default:
          throw new Error( `Tipo de efeito ${ef.tipoEfeitoId} inválido` );
      }
      // Aplica efeito na confiança
      if (ef.valorConfianca !== undefined) {
        confiancaDepois = Number(ef.valorConfianca);
      }

      // Atualiza estadoAtual com merge
      plantaManejada.estadoAtual[ef.caracteristicaId] = {
        ...atual,
        valor: valorDepois,
        confianca: confiancaDepois,
        calculadoEm: ts,
        manejos: [...(atual.manejos ?? []), eventoId],
      };

      // Registra efeito líquido no relatório
      relatorioEfeitos[ef.caracteristicaId] = {
        valorAntes: // Preserva valores anteriores se já houver efeito registrado
          relatorioEfeitos[ef.caracteristicaId]?.valorAntes ??
          valorAntes,
        valorDepois,
        deltaValor: // Calcula o delta
          valorDepois -
          (relatorioEfeitos[ef.caracteristicaId]?.valorAntes ??
            valorAntes),

        confiancaAntes: // Preserva valores anteriores se já houver efeito registrado
          relatorioEfeitos[ef.caracteristicaId]?.confiancaAntes ??
          confiancaAntes,
        confiancaDepois,
        deltaConfianca: // Calcula o delta
          confiancaDepois -
          (relatorioEfeitos[ef.caracteristicaId]?.confiancaAntes ??
            confiancaAntes),
        tiposEfeito: [ // Acumula os tipos de efeito aplicados
          ...(relatorioEfeitos[ef.caracteristicaId]
            ?.tiposEfeito ?? []),
          ef.tipoEfeitoId,
        ],
      };
    });
  }

  return {
    plantaManejada,
    relatorioEfeitos,
  };
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
export function monitorarPlanta({planta, caracteristicasMedidas, eventoId, timestamp}) {
  const results = monitorarEstadoAtual({planta, caracteristicasMedidas, eventoId, timestamp})
  // OUTRAS CONDICOES DE PLANTAS
  return results;
}

export function calcularEvolucaoTemporalPlanta({planta, catalogo, eventoId, timestamp}) {
  if (!planta) throw new Error ("Erro recalculando caracteristicas do planta: planta obrigatória.")
  if (!catalogo) throw new Error ("Erro recalculando caracteristicas do planta: catalogo obrigatório.")
  if (!eventoId) throw new Error ("Erro recalculando caracteristicas do planta: eventoId obrigatório.")
  if (!timestamp) throw new Error ("Erro recalculando caracteristicas do planta: timestamp obrigatório.")

  // Se não há condições de calcular ou entidade é morta, retorna estadoAtual Vazio
  const mutation = {estadoAtual: {}};

  if (!planta?.estadoAtual) {console.log (`${planta.id} sem estado atual`); return mutation}
  if (planta.isDeleted)     {console.log(`${planta.id} deletada`); return mutation}
  if (planta.isArchived)    {console.log (`${planta.id} arquivada`); return mutation};

  
  // para cada caracteristica presente no estado atual
  for (const caracteristicaId of Object.keys(planta.estadoAtual)) {
    const caracteristica = planta.estadoAtual[caracteristicaId];
    const caracteristicaCatalogo = catalogo.find(
      c => c.id === caracteristicaId
    );

    // Primeiro analisa se a característica tem condições de ser calculada
    if (!caracteristica) {
      console.log (`${planta.id} sem caracteristica ${caracteristicaId}`)
      continue;
    }
    if (!caracteristica.calculadoEm){
      console.log (`${planta.id} sem data de cálculo para ${caracteristicaId}`)
      continue;
    }
    if (!caracteristicaCatalogo.aplicarObsolescencia && !caracteristicaCatalogo.aplicarVariacao) {
      console.log (`Nada a fazer com ${caracteristicaId}`)
      continue
    }
    if (caracteristicaCatalogo.aplicarObsolescencia &&
      !caracteristica.confianca  && 
      !caracteristicaCatalogo.longevidade ){
      console.log(`Obsolescência inválida para ${caracteristicaId} em ${planta.id}`);
      continue;
    }
    if (caracteristicaCatalogo.aplicarVariacao &&
      caracteristica.valor === null &&
      !caracteristicaCatalogo.variacaoDiaria) {
      console.log(`Valor inválido para ${caracteristicaId} em ${planta.id}`);
      continue;
    }
      
      

    const dtMs = timestamp - caracteristica.calculadoEm;
    if (dtMs <= 0) {
      console.log(`Sem tempo mínimo decorrido para ${caracteristicaId} em ${planta.id}`);
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