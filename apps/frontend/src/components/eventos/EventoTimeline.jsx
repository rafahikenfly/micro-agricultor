import { Badge } from "react-bootstrap";
import { groupByDay, unixToReadableString } from "../../utils/dateUtils";

export function EventoTimeline({ eventos = [], onSelect }) {
  const grouped = groupByDay(eventos);

  return (
    <div className="d-flex flex-column gap-3">
      {grouped.map((group) => (
        <div key={group.label}>
          {/* Header do dia */}
          <div
            style={{
              fontWeight: 600,
              fontSize: 14,
              marginBottom: 6,
            }}
          >
            📅 {group.key}
          </div>

          {/* Eventos */}
          <div className="d-flex flex-column gap-2">
            {group.items.map((e) => (
                <div
                  key={e.id}
                  onClick={() => onSelect?.(e)}
                  style={{
                    cursor: "pointer",
                    borderRadius: 8,
                    padding: 5,
                    border: "1px solid #e5e5e5",
                    background: "#fff",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    {e.tipoEventoNome || "-"}
                    <div
                      style={{
                        fontSize: 11,
                        color: "#666",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {unixToReadableString(e.timestamp)}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}