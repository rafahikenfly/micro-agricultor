import { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { validarCategoria } from "@domain/estados.rules";
import { renderOptions } from "../../../utils/formUtils";
import { VARIANTS } from "../../../utils/consts/VARIANTS";

export default function CategoriaModal({ show, onSave, onClose, data = {}, }) {
  const [form, setForm] = useState(validarCategoria(data))

  useEffect(() => {
    if (!data) {
      setForm(validarCategoria({}));   // nova caracteristica limpo
    } else {
      setForm(validarCategoria(data)); // edição
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
      <Modal.Title>{data ? "Editar Categoria" : "Nova Categoria"}</Modal.Title>
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