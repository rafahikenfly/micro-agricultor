import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { validarUsuario } from "../../domain/usuarios.rules";
import UsuarioDadosTab from "./UsuarioDadosTab";
import UsuarioAcessosTab from "./UsuarioAcessosTab";

export default function UsuarioModal({ show, onSave, onClose, data = {}, }) {
    if (!show) return null;

    // Controle de tab
  const [tab, setTab] = useState("dados");
  const [form, setForm] = useState(validarUsuario(data))
  
  useEffect(() => {
    if (!data) {
      setForm(validarUsuario({}));   // novo usuario limpo
    } else {
      setForm(validarUsuario(data)); // edição
    }
  }, [data]);
    
  const salvar = () => {
    onSave({
      ...form,
    });
  };
    
  return (
    <Modal show onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{data ? "Editar Usuario" : "Novo Usuario"}</Modal.Title>
      </Modal.Header>

        <Modal.Body>
          <Form onSubmit={salvar}>
        
          <Tabs
            activeKey={tab}
            onSelect={(k) => setTab(k)}
            className="mb-3"
          >
            <Tab eventKey="dados" title="Dados do Usuário">
              <UsuarioDadosTab
                form={form}
                setForm={setForm}
              />
            </Tab>
            <Tab eventKey="acessos" title="Acessos">
              <UsuarioAcessosTab
                form={form}
                setForm={setForm}
              />
            </Tab>
          </Tabs>
          </Form>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="success" onClick={salvar}>Salvar</Button>
        </Modal.Footer>
      </Modal>
    )
}