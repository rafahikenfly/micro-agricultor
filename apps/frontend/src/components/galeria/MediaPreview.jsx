import { Offcanvas, Badge, Button } from "react-bootstrap";
import { useMemo } from "react";

export function MediaPreview({ media, onClose }) {
  const dataFormatada = useMemo(() => {
    return new Date(media?.contexto?.timestamp).toLocaleString();
  }, [media]);

  if (!media) return null;

  return (
    <Offcanvas show={!!media} onHide={onClose} placement="end" style={{ width: 400 }}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>{media.nome || "Mídia"}</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
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
            <li><strong>Tipo:</strong> {media.tipoMediaNome}</li>
            <li><strong>MIME:</strong> {media.mimeType}</li>
            <li><strong>Tamanho:</strong> {media.metadados?.bytes} bytes</li>
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
            <li><strong>Data:</strong> {dataFormatada}</li>
            <li><strong>Entidade:</strong> {media.contexto?.tipoEntidadeNome}</li>
            <li><strong>ID:</strong> {media.contexto?.entidadeId}</li>
          </ul>
        </div>

        {/* Ações */}
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
      </Offcanvas.Body>
    </Offcanvas>
  );
}