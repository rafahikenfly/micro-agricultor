import { Card, Badge } from "react-bootstrap";

export function MediaGrid({ midias = [], onSelect }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: 12,
      }}
    >
      {midias.map((m) => {
        const data = new Date(m.contexto?.timestamp).toLocaleDateString();

        return (
          <Card
            key={m.id}
            style={{
              cursor: "pointer",
              overflow: "hidden",
              borderRadius: 10,
            }}
            onClick={() => onSelect?.(m)}
          >
            <div style={{ position: "relative" }}>
              <img
                src={m.metadados?.url}
                alt={m.nome}
                loading="lazy"
                style={{
                  width: "100%",
                  height: 120,
                  objectFit: "cover",
                }}
              />

              {/* Data overlay */}
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
                {data}
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
          </Card>
        );
      })}
    </div>
  );
}