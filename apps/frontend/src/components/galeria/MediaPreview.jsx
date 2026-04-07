import { Badge, Button } from "react-bootstrap";
import { ENTIDADE } from "micro-agricultor";
import { unixToReadableString } from "../../utils/dateUtils";

export function MediaPreview({ media, onClose }) {
  if (!media) return null;

  return (
    <>
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h6 className="mb-0">{media.nome || "Mídia"}</h6>

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
      <div className="d-flex gap-2">
        <Button
          size="sm"
          variant="outline-primary"
          onClick={() => console.log("anotar", media.id)}
        >
          Marcar como anotada
        </Button>

        <Button
          size="sm"
          variant="outline-danger"
          onClick={() => console.log("deletar", media.id)}
        >
          Deletar
        </Button>
      </div>

      {/* Imagem */}
      <div className="mb-3 text-center">
        <img
          src={media.metadados?.url}
          alt={media.nome}
          style={{
            maxWidth: "100%",
            borderRadius: 8,
          }}
        />
      </div>

      {/* Descrição */}
      {media.descricao && (
        <p className="text-muted">{media.descricao}</p>
      )}

      {/* Status */}
      <div className="mb-3">
        {media.metadados?.anotada && (
          <Badge bg="warning" text="dark">
            Anotada
          </Badge>
        )}
      </div>

      {/* Metadados */}
      <div className="mb-3">
        <h6>Metadados</h6>
        <ul className="list-unstyled small">
          <li><strong>MIME:</strong> {media.mimeType}</li>
          <li><strong>Tamanho:</strong> {(media.metadados?.bytes/1024).toFixed(2)} kb</li>
          <li>
            <strong>Resolução:</strong>{" "}
            {media.metadados?.largura} x {media.metadados?.altura}
          </li>
        </ul>
      </div>

      {/* Contexto */}
      <div className="mb-3">
        <h6>Contexto</h6>
        <ul className="list-unstyled small">
          <li><strong>Data:</strong> {unixToReadableString(media.contexto?.timestamp) ?? "-"}</li>
          <li><strong>Tipo de Entidade:</strong> {ENTIDADE[media.contexto?.tipoEntidadeId]?.nome ?? "-"}</li>
          <li><strong>Entidade ID:</strong> {media.contexto?.entidadeId ?? "-"}</li>
        </ul>
      </div>

    </>
  );
}