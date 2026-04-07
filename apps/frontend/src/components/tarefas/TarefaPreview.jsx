import { Button } from "react-bootstrap";
import { unixToReadableString } from "../../utils/dateUtils";

export function TarefaPreview({ tarefa, onClose }) {
  if (!tarefa) return null;

  return (
    <div className="tarefa-preview d-flex flex-column gap-3">
      
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h5 className="mb-1">{tarefa.nome}</h5>
          <small className="text-muted">
            {unixToReadableString(tarefa.planejamento.vencimento)}
          </small>
        </div>

        <Button
          size="sm"
          variant="outline-secondary"
          onClick={onClose}
        >
          ✕
        </Button>
      </div>

      {/* STATUS */}
      {tarefa.estado && (
        <div>
          <strong>Estado:</strong>{" "}
          <span className="text-muted">{tarefa.estado}</span>
        </div>
      )}

      {/* DESCRIÇÃO */}
      {tarefa.descricao && (
        <div>
          <strong>Descrição</strong>
          <div className="text-muted">{tarefa.descricao}</div>
        </div>
      )}

      {/* RESPONSÁVEL */}
      {tarefa.responsavel && (
        <div>
          <strong>Responsável:</strong>{" "}
          <span className="text-muted">{tarefa.responsavel}</span>
        </div>
      )}

      {/* AÇÕES (placeholder) */}
      <div className="d-flex gap-2 mt-2">
        <Button size="sm" variant="outline-primary">
          Editar
        </Button>
        <Button size="sm" variant="outline-danger">
          Remover
        </Button>
      </div>
    </div>
  );
}