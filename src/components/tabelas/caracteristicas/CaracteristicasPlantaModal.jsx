import { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";

export default function CaracteristicasPlantaModal({ show, onSave, onClose, data = {}, }) {
  const [form, setForm] = useState({
      nome: data?.nome || "",
      descricao: data?.descricao || "",
      unidade: data?.unidade || "",
      longevidade: data?.longevidade || 0,
    }
  );

  useEffect(() => {
      if (data) setForm(data);
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
      <Modal.Title>{data ? "Editar Característica de Planta" : "Novo Característica de Planta"}</Modal.Title>
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
            <Form.Label>Longevidade (dias)</Form.Label>
            <Form.Control
              value={form.longevidade}
              onChange={e => setForm({...form, longevidade: e.target.value})}
            />
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