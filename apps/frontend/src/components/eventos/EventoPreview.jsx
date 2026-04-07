import { Badge, Button } from "react-bootstrap";
import { ENTIDADE } from "micro-agricultor";
import { unixToReadableString } from "../../utils/dateUtils";

export function EventoPreview({ evento, onClose }) {
  if (!evento) return null;

  return (
    <>
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h6 className="mb-0">{evento.tipo || "Evento"}</h6>

        {onClose && (
          <Button
            size="sm"
            variant="light"
            onClick={onClose}
            style={{ lineHeight: 1 }}
          >
            ✕
          </Button>
        )}
      </div>

      {/* AÇÕES */}
      <div className="d-flex gap-2 mb-3">
        <Button
          size="sm"
          variant="outline-primary"
          onClick={() => console.log("ver entidade", evento.id)}
        >
          Ver entidade
        </Button>

        <Button
          size="sm"
          variant="outline-danger"
          onClick={() => console.log("deletar evento", evento.id)}
        >
          Deletar
        </Button>
      </div>

      {/* DESCRIÇÃO */}
      {evento.descricao && (
        <p className="text-muted">{evento.descricao}</p>
      )}

      {/* STATUS / TAGS */}
      <div className="mb-3 d-flex gap-1 flex-wrap">
        {evento.tipo && (
          <Badge bg="secondary">
            {evento.tipo}
          </Badge>
        )}

        {evento.usuarioNome && (
          <Badge bg="light" text="dark">
            👤 {evento.usuarioNome}
          </Badge>
        )}
      </div>

      {/* DADOS DO EVENTO */}
      <div className="mb-3">
        <h6>Detalhes</h6>
        <ul className="list-unstyled small">
          <li>
            <strong>Data:</strong>{" "}
            {unixToReadableString(evento.timestamp) ?? "-"}
          </li>

          <li>
            <strong>ID:</strong> {evento.id ?? "-"}
          </li>

          {evento.tipo && (
            <li>
              <strong>Tipo:</strong> {evento.tipo}
            </li>
          )}
        </ul>
      </div>

      {/* ENTIDADES RELACIONADAS */}
      <div className="mb-3">
        <h6>Entidades</h6>
        <ul className="list-unstyled small">
          {(evento.entidadesKey ?? []).map((key) => {
            const [tipoEntidadeId, entidadeId] = key.split(":");

            return (
              <li key={key}>
                <strong>
                  {ENTIDADE[tipoEntidadeId]?.nome ?? tipoEntidadeId}:
                </strong>{" "}
                {entidadeId}
              </li>
            );
          })}
        </ul>
      </div>

      {/* PAYLOAD (se existir) */}
      {evento.payload && (
        <div className="mb-3">
          <h6>Dados</h6>
          <pre
            style={{
              fontSize: 11,
              background: "#f5f5f5",
              padding: 8,
              borderRadius: 6,
              maxHeight: 200,
              overflow: "auto",
            }}
          >
            {JSON.stringify(evento.payload, null, 2)}
          </pre>
        </div>
      )}
    </>
  );
}