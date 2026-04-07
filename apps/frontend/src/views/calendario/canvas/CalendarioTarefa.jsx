
import { ESTADO_TAREFA } from "micro-agricultor";
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

  const style = {
    color: tarefa.aparencia?.borda,
    backgroundColor: tarefa.aparencia?.fundo,
    borderLeft: `${tarefa.aparencia?.espessura}px solid ${tarefa.aparencia?.borda || "#000"}`,
  };

  const total = necessidades.length;
  const atendidas = necessidades.filter(n => n.ativo === false).length;

  const conclusao = total === 0
    ? 100
    : Number(((atendidas / total) * 100).toFixed(2));  

  return (
    <div
      className={`cal-item cal-tarefa
        ${isSelected ? "selected" : ""}
        ${isDone ? "done" : ""}`
      }
      style={style}
      onClick={(evt) => handlers.onClick(evt)}
      onDoubleClick={(evt) => handlers.onDoubleClick(evt)}
    >
      <div className="cal-title">
        {tarefa.nome}
        {tarefa.recorrencia !== "none" && (
          <span className="cal-recorrencia">🔁</span>
        )}
      </div>

      <div className="cal-time">
        {unixToReadableString(tarefa.planejamento.vencimento)}
      </div>

      <div className="cal-conclusao">
        {conclusao}% concluída
      </div>

      {!isDone && (
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
  );
}