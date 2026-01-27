import { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";

export default function UsuariosModal({ show, onSave, onClose, data, }) {
    const [form, setForm] = useState({
        nome: "",
        email: "",
        nomeExibicao: "", 
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
        <Modal.Title>{data ? "Editar Usuário" : "Novo Usuário"}</Modal.Title>
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
              <Form.Label>email</Form.Label>
              <Form.Control
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
              />
            </Form.Group>
        
            <Form.Group className="mb-3">
              <Form.Label>Nome Exibido</Form.Label>
              <Form.Control
                value={form.nomeExibicao}
                onChange={e => setForm({...form, nomeExibicao: e.target.value})}
                required
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