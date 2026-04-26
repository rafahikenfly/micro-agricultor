import { Badge } from "react-bootstrap";
import { groupByDay, unixToReadableString } from "../../utils/dateUtils";
import { VARIANTE } from "micro-agricultor";

export function TarefaTimeline({
  tarefas = [],
  selected,
  onSelect,
}) {
  const grouped = groupByDay(tarefas);

  if (!tarefas.length) {
    return (
      <div className="text-muted p-3">
        Nenhuma tarefa encontrada
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {grouped.map((group) => (
        <div key={group.label}>
          {/* HEADER DO DIA */}
          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              marginBottom: 6,
            }}
          >
            📅 {group.key}
          </div>

          {/* TAREFAS */}
          <div className="d-flex flex-column gap-2">
            {group.items.map((t) => {
              const isActive = selected?.id === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => onSelect?.(t)}
                  style={{
                    cursor: "pointer",
                    borderRadius: 8,
                    padding: 8,
                    border: isActive
                      ? "1px solid #0d6efd"
                      : "1px solid #e5e5e5",
                    background: isActive ? "#eef4ff" : "#fff",
                  }}
                >
                  {/* HEADER */}
                  <div className="d-flex justify-content-between align-items-start">
                    <strong className="text-truncate">
                      {t.nome}
                    </strong>

                    <div
                      style={{
                        fontSize: 11,
                        color: "#666",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {unixToReadableString(t.timestamp)}
                    </div>
                  </div>

                  {/* DESCRIÇÃO */}
                  {!!t.descricao && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#666",
                      }}
                      className="text-truncate"
                    >
                      {t.descricao}
                    </div>
                  )}

                  {/* FOOTER */}
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    {t.estado ? (
                      <Badge bg={VARIANTE.RED.variant}>
                        {t.estado}
                      </Badge>
                    ) : (
                      <span />
                    )}

                    {!!t.planejamento.vencimento && (
                      <small style={{ fontSize: 11, color: "#666" }}>
                        ⏱ {unixToReadableString(t.planejamento.vencimento)}
                      </small>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}