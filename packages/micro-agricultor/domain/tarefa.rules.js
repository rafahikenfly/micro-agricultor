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
    tipoEntidadeId: "",   // ENTITY_TYPES
    entidadesId: [],      // string [ entidadeId ]
    caracteristicaId: "", // Catalogo Características
    tipoEventoId: "",     // EVENTO_TYPES
  },
  planejamento: {
    prioridade: 0,
    venceEm: 0,
    recorrencia: {
      tipoRecorrenciaId: RECORRENCIA.NENHUMA.id,    // default seguro
      tipoRecorrenciaFim: RECORRENCIA_FIM.NUNCA.id, // default seguro
      expiraEm: null,
      expiraApos: null,
      execucoes: 0,
    },
  },
  execucao: null,
  //{
  //  adquiridoEm: 0,
  //  adquiridoAte: 0,
  //  iniciadoEm: 0,
  //  finalizadoEm: 0,
  //  tentativas: 0,
  //  maxTentativas: 3,
  //  agente: {
  //    tipo: "",
  //    id: "",
  //  },
  //}
  resolucao: null
  //{
  //  tipoResolucaoId: "",
  //  tipoEventoId: "",
  //  resolvidoEm: "",
  //  agente: {
  //    tipo: "",
  //    id: "",
  //  },
  //}
}

export const validarTarefa = (dataObj = {}) => {
    const valid = mergeComValidacao(tarefaPadrao, dataObj);
    return valid;
}

export const criarTarefa = ({ contexto, planejamento, resolucao, dados}) => {
  const novaTarefa = {
    ...tarefaPadrao,
    contexto: { ...tarefaPadrao.contexto, ...contexto },
    planejamento: { ...tarefaPadrao.planejamento, ...planejamento },
    resolucao: resolucao ?? structuredClone(tarefaPadrao.resolucao),
    ...dados,
  };

  const valid = validarTarefa(novaTarefa);
  return valid;
}

export const adquirirTarefa = ({tarefa, agente, timestamp, prazoExpiracao = 3000}) => {
  if (tarefa.resolucao?.tipoResolucaoId) throw new Error(`[adquirirTarefa] Tarefa ${tarefa.id} já resolvida`);
  if (tarefa.execucao !== null) {
    const expirou = tarefa.execucao.expiraEm < timestamp;
    if (!expirou) throw new Error(`[adquirirTarefa] Tarefa ${tarefa.id} com execução não expirada`);
  }

  return {
    ...tarefa,
    execucao: {
      adquiridoEm: timestamp,
      expiraEm: timestamp + prazoExpiracao,
      tentativas: (tarefa.execucao?.tentativas ?? 0) + 1,
      agente,
    }
  };
}

export const resolverTarefa = ({tarefa, agente, timestamp, tipoResolucaoId, tipoEventoId}) => {
  if (tarefa.resolucao?.tipoResolucaoId) throw new Error(`[resolverTarefa] Tarefa ${tarefa.id} já resolvida`);

  const tarefaResolvida = {...resolveRecorrencia({tarefa,timestamp})}
  tarefaResolvida.resolucao = {
    ...(tarefaResolvida.resolucao ?? {}),
    tipoResolucaoId,
    tipoEventoId,
    resolvidoEm: timestamp,
    agente
  }

  return tarefaResolvida
}

function resolveRecorrencia({ tarefa, timestamp }) {
  const r = tarefa.planejamento?.recorrencia;

  // Sem recorrencia
  if (!r || r.tipoRecorrenciaId === RECORRENCIA.NENHUMA.id) {
    return {
      ...tarefa,
      estado: ESTADO_TAREFA.FEITO.id,
    };
  }

  // Recorrência expirada
  const novasExecucoes = (r.execucoes ?? 0) + 1;
  const passouData =
    r.terminaEm !== null &&
    timestamp > r.terminaEm;
  const passouQuantidade =
    r.quantidade !== null &&
    novasExecucoes >= r.quantidade;
  const expirou = passouData || passouQuantidade;
  if (expirou) {
    return { 
      ...tarefa,
      estado: ESTADO_TAREFA.FEITO.id,
      resolucao: {
        ...(tarefa.resolucao ?? {}),
        tipoResolucaoId: RESOLUCAO.EXPIRADO.id,
      }
     };
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
      throw new Error(`[resolveRecorrencia]: Recorrência não suportada: ${r.tipoRecorrenciaId}`);
  }

  return {
    ...tarefa,
    estado: ESTADO_TAREFA.PENDENTE.id,
    planejamento: {
      ...tarefa.planejamento,
      venceEm: proximoVencimento,
      recorrencia: {
        ...tarefa.planejamento.recorrencia,
        execucoes: novasExecucoes,
      }
    },
    execucao: null,
    resolucao: null,
  };
}