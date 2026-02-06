import { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { validarCaracteristica } from "../../../domain/estados.rules";
import { renderOptions } from "../../../utils/formUtils";
import { TIPOS_ENTIDADE } from "../../../utils/consts/TIPOS_ENTIDADE";
import { VARIANTS } from "../../../utils/consts/VARIANTS";

export default function CaracteristicaModal({ show, onSave, onClose, data = {}, }) {
  const [form, setForm] = useState(validarCaracteristica(data))

  useEffect(() => {
    if (!data) {
      setForm(validarCaracteristica({}));   // nova caracteristica limpo
    } else {
      setForm(validarCaracteristica(data)); // edição
    }
  }, [data]);
  
    const salvar = () => {
      onSave({
        ...form,
      });
    };
  
  if (!show) return null;
  return (
  <Modal show onHide={onClose} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>{data ? "Editar Característica" : "Nova Característica"}</Modal.Title>
    </Modal.Header>

      <Modal.Body>
        <Form onSubmit={salvar}>

          <Form.Group className="mb-3">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              value={form.nome}
              onChange={e => setForm({...form, nome: e.target.value})}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descrição</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={form.descricao}
              onChange={e => setForm({...form, descricao: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Unidade</Form.Label>
            <Form.Control
              value={form.unidade}
              onChange={e => setForm({...form, unidade: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Aplicável a:</Form.Label>

            <div className="d-flex flex-wrap gap-3 mt-2">
              {TIPOS_ENTIDADE.map((tipo) => (
                <Form.Check
                  key={tipo.id}
                  type="checkbox"
                  label={tipo.nome}
                  checked={!!form.aplicavel?.[tipo.id]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      aplicavel: {
                        ...form.aplicavel,
                        [tipo.id]: e.target.checked
                      }
                    })
                  }
                />
              ))}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Longevidade (dias)</Form.Label>
            <Form.Control
              value={form.longevidade}
              onChange={e => setForm({...form, longevidade: Number(e.target.value)})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Resolução (cm)</Form.Label>
            <Form.Control
              value={form.resolucao}
              onChange={e => setForm({...form, resolucao: Number(e.target.value)})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Cor da Tag</Form.Label>
            <Form.Select
              value={form.tagVariant}
              onChange={e => setForm({...form, tagVariant: e.target.value})}
              label="Cor da Tag"
              required
            >
              {renderOptions({
                list: VARIANTS,
                placeholder: "Selecione a cor da tag",
              })}
            </Form.Select>
          </Form.Group>

        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="success" onClick={salvar}>Salvar</Button>
      </Modal.Footer>
    </Modal>
  )
}