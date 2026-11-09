// TAREFA é um agregador que enriquece o contexto de uma ou mais NECESSIDADES.
// Por definição, tarefa tem um contexto: um motivo, um tipo de entidade,
// um tipo de evento a uma característica, um conjunto de entidades
// Ex: A tarefa é algo como "MONITORAR NÚMERO DE FOLHAS" e pode ter N entidades do tipo PLANTA.
// Cada tarefa tem um planejamento e uma resolução, além de estado.

import { ESTADO_TAREFA, RECORRENCIA, RECORRENCIA_FIM, RESOLUCAO } from "../types/index.js";
import { adicionarAno, adicionarDia, adicionarMes, mergeComValidacao } from "./rulesUtils.js";

const aparenciaPadrao = {
    fundo: "#f56f42",
    borda: "#f54242",
    espessura: 1,
    geometria: "circle",
    vertices: [],
};


const tarefaPadrao = {
  //dados
  nome: "Nova Tarefa",
  descrição: "",
  estado: ESTADO_TAREFA.PENDENTE.id,     // default seguro
  aparencia: aparenciaPadrao,
  contexto: {
    tipoEntidadeId: "",   // ENTIDADE
    entidadesId: [],      // string [ entidadeId ]
    caracteristicaId: "", // Catalogo Características
    tipoEventoId: "",     // EVENTO_TYPES
  },
  planejamento: {
    prioridade: 0,
    venceEm: 0,
    recorrencia: {
      tarefaOrigemId: null,
      tipoRecorrenciaId: RECORRENCIA.NENHUMA.id,    // default seguro
      tipoRecorrenciaFim: RECORRENCIA_FIM.NUNCA.id, // default seguro
      expiraEm: null,
      expiraApos: null,
      execucoes: 0,
    },
  },
  execucao:
  {
    adquiridaEm: 0,
    adquiridaAte: 0,
  //  iniciadoEm: 0,
  //  finalizadoEm: 0,
    tentativas: 0,
    ultimoErro: "",
    maxTentativas: 3,
    agente: {
      tipo: "",
      id: "",
    },
  },
  resolucao:
  {
    tipoResolucaoId: "",
    resolvidoEm: "",
  //  agente: {
  //    tipo: "",
  //    id: "",
  //  },
  }
}

export const validarTarefa = (dataObj = {}) => {
    const valid = mergeComValidacao(tarefaPadrao, dataObj);
    return valid;
}
0
export const criarTarefa = ({ contexto, planejamento, resolucao, execucao, dados}) => { //TODO: update
  const novaTarefa = {
    ...tarefaPadrao,
    contexto: { ...tarefaPadrao.contexto, ...contexto },
    execucao: { ...tarefaPadrao.execucao, ...execucao },
    planejamento: { ...tarefaPadrao.planejamento, ...planejamento },
    resolucao: { ...tarefaPadrao.resolucao, ...resolucao },
    ...dados,
  };

  const valid = validarTarefa(novaTarefa);
  return valid;
}
export const podeAdquirirTarefa = ({tarefa, timestamp}) => {
  if (!tarefa) {console.error("Nenhuma tarefa!"); return false;}
  if (tarefa.estado === ESTADO_TAREFA.PROCESSANDO.id) return false;
  if (tarefa.estado === ESTADO_TAREFA.FEITO.id)  return false;
  if (tarefa.estado === ESTADO_TAREFA.PENDENTE.id) {
    if (timestamp < tarefa.execucao.adquiridaAte)  return false;
  };
  if (tarefa.estado === ESTADO_TAREFA.ERRO.id) {
      if (tarefa.execucao.tentativas > tarefa.execucao.maxTentativas) return false;
  }

  return true;
}
export const adquirirTarefa = ({tarefa, agente, timestamp, prazoExpiracao = 3000}) => {
  if (!podeAdquirirTarefa({tarefa, timestamp})) return false;
  return {
    ...tarefa,
    estado: ESTADO_TAREFA.PROCESSANDO.id,
    execucao: {
      ...tarefa.execucao,
      adquiridaEm: timestamp,
      adquiridaAte: timestamp + prazoExpiracao,
      tentativas: (tarefa.execucao?.tentativas ?? 0) + 1,
      agente,
    }
  };
}
export const falharTarefa = ({tarefa, erro, timestamp}) => {
  return {
    ...tarefa,
    estado: ESTADO_TAREFA.ERRO.id,
    execucao: {
      ...tarefa.execucao,
      ultimoErro: erro,
      adquiridaAte: timestamp,
    }
  }
}
export const concluirTarefa = ({tarefa, timestamp}) => {
  return {
    ...tarefa,
    estado: ESTADO_TAREFA.FEITO.id,
    resolucao:{
      ...(tarefa.resolucao ?? {}),
      tipoResolucaoId: RESOLUCAO.CONCLUIDO,
      resolvidoEm: timestamp,
    }
  }
}





export const resolverTarefa = ({tarefa, tipoResolucaoId, agente, timestamp}) => {
  if (tarefa.resolucao?.tipoResolucaoId) throw new Error(`[resolverTarefa] Tarefa ${tarefa.id} já resolvida`);
  const tarefaResolvida = {
    ...tarefa,
    estado: ESTADO_TAREFA.FEITO.id,
    resolucao: {
      ...(tarefa.resolucao ?? {}),
      resolvidoEm: timestamp,
      tipoResolucaoId,
      agente
    }
  }

  const novaTarefa = resolverRecorrencia({ tarefa, timestamp })

  return { tarefaResolvida, novaTarefa }
}

function resolverRecorrencia({ tarefa, timestamp }) {
  const r = tarefa.planejamento?.recorrencia;

  // Sem recorrencia
  if (!r || r.tipoRecorrenciaId === RECORRENCIA.NENHUMA.id) {
    return null;
  }

  // Recorrência expirada
  const novoExecucoes = (r.execucoes ?? 0) + 1;
  const passouData =
    r.terminaEm !== null &&
    timestamp > r.terminaEm;
  const passouQuantidade =
    r.quantidade !== null &&
    novoExecucoes >= r.quantidade;
  const expirou = passouData || passouQuantidade;
  if (expirou) {
    return null
  }

  // Recorrência vigente
  let proximoVencimento;
  switch (r.tipoRecorrenciaId) {
    case RECORRENCIA.DIARIA.id:
      proximoVencimento = adicionarDia(timestamp);
      break;
    case RECORRENCIA.SEMANAL.id:
      proximoVencimento = adicionarDia(timestamp, 7);
      break;
    case RECORRENCIA.QUINZENAL.id:
      proximoVencimento = adicionarDia(timestamp, 14);
      break;
    case RECORRENCIA.MENSAL.id:
      proximoVencimento = adicionarMes(timestamp);
      break;
    case RECORRENCIA.BIMESTRAL.id:
      proximoVencimento = adicionarMes(timestamp, 2);
      break;
    case RECORRENCIA.TRIMESTRAL.id:
      proximoVencimento = adicionarMes(timestamp, 3);
      break;
    case RECORRENCIA.SEMESTRAL.id:
      proximoVencimento = adicionarMes(timestamp, 6);
      break;
    case RECORRENCIA.ANUAL.id:
      proximoVencimento = adicionarAno(timestamp);
      break;
    default:
      throw new Error(`[resolverRecorrencia]: Recorrência não suportada: ${r.tipoRecorrenciaId}`);
  }

  return {
    ...tarefa,
    estado: ESTADO_TAREFA.PENDENTE.id,
    planejamento: {
      ...tarefa.planejamento,
      venceEm: proximoVencimento,
      recorrencia: {
        ...tarefa.planejamento.recorrencia,
        tarefaOrigemId: tarefa.planejamento.recorrencia.tarefaOrigemId ?? tarefa.id,
        execucoes: novoExecucoes,
      }
    },
    execucao: null,
    resolucao: null,
  }
}