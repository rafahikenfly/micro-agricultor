import { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";

export default function CVJobsModal({ show, onSave, onClose, data, }) {
    const [form, setForm] = useState({
        nome: data.nome || "",
        descricao: data.descricao || "",
        instrucoes: data.instrucoes || "",
        parametros: data.parametros || {},
        tipoEntidade: data.tipoEntidade || "",
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
        <Modal.Title>{data ? "Editar Tarefa de Visão Computacional" : "Novo Tarefa de Visão Computacional"}</Modal.Title>
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
              <Form.Label>Instruções</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.instrucoes}
                onChange={e => setForm({...form, instrucoes: e.target.value})}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Tipo de Entidade</Form.Label>
              <Form.Select
                value={form.tipoEntidade}
                onChange={e => setForm({ ...form, tipoEntidade: e.target.value })}
              >
                <option disabled>Selecione</option>
                <option value="canteiro">Canteiro</option>
                <option value="planta">Planta</option>
                <option value="horta">Horta</option>
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