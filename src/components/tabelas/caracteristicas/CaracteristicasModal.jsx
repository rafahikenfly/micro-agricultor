import { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { TIPOS_ENTIDADE } from "../../../utils/consts/TIPOS_ENTIDADE";

export default function CaracteristicasPlantaModal({ show, onSave, onClose, data = {}, }) {
  const [form, setForm] = useState({
      nome: data?.nome || "",
      descricao: data?.descricao || "",
      unidade: data?.unidade || "",
      longevidade: data?.longevidade || 0,
      resolucao: data?.resolucao || 30,
      aplicavel: data?.aplicavel || {}, 
    }
  );

  useEffect(() => {
      if (data) setForm({
        ...data,
        aplicavel: data.aplicavel || {}
      });
    }, [data]);
  
    const salvar = () => {
      onSave({
        ...form,
        aplicavel: form.aplicavel || {}
      });
    };
  
  if (!show) return null;
  return (
  <Modal show onHide={onClose} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>{data ? "Editar Característica de Canteiro" : "Nova Característica de Canteiro"}</Modal.Title>
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

        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="success" onClick={salvar}>Salvar</Button>
      </Modal.Footer>
    </Modal>
  )
}