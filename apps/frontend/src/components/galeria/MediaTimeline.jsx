import { Badge } from "react-bootstrap";
import { groupByDay } from "../../utils/dateUtils";

export function MidiaTimeline({ midias = [], onSelect }) {
  const grouped = groupByDay(midias);

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

          {/* Grid do dia */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: 8,
            }}
          >
            {group.items.map((m) => {
              const hora = new Date(
                m.contexto?.timestamp
              ).toLocaleTimeString();

              return (
                <div
                  key={m.id}
                  style={{
                    position: "relative",
                    cursor: "pointer",
                  }}
                  onClick={() => onSelect?.(m)}
                >
                  <img
                    src={m.metadados?.url}
                    alt={m.nome}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />

                  {/* Hora */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 4,
                      left: 4,
                      background: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: 6,
                    }}
                  >
                    {hora}
                  </div>

                  {/* Badge anotada */}
                  {m.metadados?.anotada && (
                    <Badge
                      bg="warning"
                      text="dark"
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        fontSize: 10,
                      }}
                    >
                      ✏️
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}