
import { ESTADO_TAREFA, RECORRENCIA } from "micro-agricultor";
import { useAuth } from "../../../services/auth/authContext";
import { unixToReadableString } from "../../../utils/dateUtils";
import { useCalendarioEngine } from "../CalendarioEngine";
import { createCalendarioTarefaHandler } from "../handlers/CalendarioTarefa.handler";

export default function CalendarioTarefa({ tarefa, necessidades}) {
  const user = useAuth();
  const engine = useCalendarioEngine();
  const handlers = createCalendarioTarefaHandler(engine, tarefa)

  //TODO: isSelected vai para a engine
  const isSelected =
    engine.itemSelecionado?.id === tarefa.id &&
    engine.itemSelecionado?.type === "tarefa";
  const isDone = tarefa.estado === ESTADO_TAREFA.FEITO.id
  const isErro = tarefa.estado === ESTADO_TAREFA.ERRO?.id;
  const isAdquirida = tarefa.execucao?.adquiridaEm !== null;
  const isAtrasada = tarefa.planejamento.vencimento < Date.now() && !isDone;
  const isRecorrente = tarefa.planejamento.recorrencia.tipoRecorrenciaId !== RECORRENCIA.NENHUMA;


  const total = necessidades.length;
  const atendidas = necessidades.filter(n => n.ativo === false).length;

  const conclusao = total === 0
    ? 100
    : Number(((atendidas / total) * 100).toFixed(2));  

  const style = {
    color: tarefa.aparencia?.borda,
    borderLeft: `5px solid ${tarefa.aparencia?.borda || "#000"}`,
  };

  return (
    <div
      className={`cal-item cal-tarefa
        ${isSelected ? "selected" : ""}
        ${isDone ? "done" : ""}
        ${isErro ? "erro" : ""}
        ${isAtrasada ? "atrasada" : ""}
        ${isAdquirida ? "adquirida" : ""}
      `}
      style={style}
      onClick={(evt) => handlers.onClick(evt)}
      onDoubleClick={(evt) => handlers.onDoubleClick(evt)}
    >

    {/* Título */}
      <div className="cal-title">
        <span className="cal-title-text">{tarefa.nome}</span>
        {isRecorrente && <span className="cal-icon">🔁</span>}
        {isErro && <span className="cal-icon">⚠️</span>}
      </div>
      {/* Conteúdo */}
      <div className="cal-meta" style={{
          marginLeft: "-5px",
          paddingLeft: "5px",
          marginRight: "-5px",
          paddingRight: "5px",
          background: `linear-gradient(
            to right,
            rgba(100,100,100,0.3) max(0px, calc(${conclusao}% - 5px)),
            transparent max(0px, calc(${conclusao}% - 5px))
          )`
        }}>
        <div className="cal-meta">
          <span>{unixToReadableString(tarefa.planejamento.vencimento)}</span>

          {isAtrasada && <span className="badge atraso">Atrasada</span>}
          {isErro && <span className="badge erro">Erro</span>}
          {isAdquirida && <span className="badge adquirida">Adquirida</span>}
        </div>
        {isDone && (
          <button
            className="cal-execute-btn"
            onClick={(e) => {
              e.stopPropagation();
              handlers.onExecutar();
            }}
          >
            ▶
          </button>
        )}
      </div>
    </div>
  );
}