import { useEffect, useState } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import ListaAcoes from "../common/ListaAcoes";
import { renderOptions, handleSelectIdNome } from "../../utils/formUtils";

export default function AssociarManejosModal({
  show,
  onClose,
  onChange,   // recebe o novo array de manejos
  form,       // fonte de verdade  manejos = [],
  idxRegra,   // parametro devolvido com o idxRegra no array de regras
  catalogoManejos = [],
  loading,
}) {
  if (!show) return null;

  const [novoManejo, setNovoManejo] = useState({
    manejoId: "",
    manejoNome: "",
  });

  const adicionarManejo = () => {
    if (!novoManejo.manejoId) return;

    const novo = {
      manejoId: novoManejo.manejoId,
      manejoNome: novoManejo.manejoNome,
    };
    onChange([...(form?.manejos || []), novo], idxRegra);

    // limpa o select
    setNovoManejo({ manejoId: "", manejoNome: "" });
  };

const excluirManejo = (dataManejo, idxManejo) => {
  onChange((form.manejos || []).filter((_, i) => i !== idxManejo), idxRegra);
};

  return (
    <Modal show onHide={onClose} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>Associar manejos à regra</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Inserção de ação */}
        <Form.Group className="d-flex-column gap-2 mb-3">
          <Form.Label className="fw-semibold">Novo Manejo</Form.Label>

          <InputGroup>
            <Form.Select
              value={novoManejo.manejoId}
              onChange={e =>
                handleSelectIdNome(e, {
                  list: catalogoManejos,
                  setForm: setNovoManejo,
                  fieldId: "manejoId",
                  fieldNome: "manejoNome"
                })
              }
            >
              {renderOptions({ list: catalogoManejos, loading})}
            </Form.Select>

            <Button onClick={adicionarManejo}>Adicionar</Button>
          </InputGroup>
        </Form.Group>

        {/* Lista de ações */}
        <ListaAcoes
          dados={form?.manejos || []}
          colunas={[
            { rotulo: "Manejo", dataKey: "manejoNome" },
          ]}
          acoes={[
            { rotulo: "Excluir", funcao: excluirManejo, variant: "danger" }
          ]}
        />
      </Modal.Body>
    </Modal>
  );
}
