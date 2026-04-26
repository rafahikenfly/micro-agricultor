import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { validarUsuario } from "micro-agricultor";
import UsuarioDadosTab from "./UsuarioDadosTab";
import UsuarioAcessosTab from "./UsuarioAcessosTab";
import { handleSaveForm } from "../../../utils/formUtils";

export default function UsuarioModal({ show, onSave, onClose, data = {}, }) {
    if (!show) return null;

    // Controle de tab
  const [tab, setTab] = useState("dados");
  const [form, setForm] = useState(validarUsuario(data))
  
  // ========== CARREGAR DADOS ==========
  // Sanitiza data
  useEffect(() => { setForm(validarUsuario(data ?? {})); }, [data]);
    
  return (
    <Modal show onHide={onClose} size="lg">
      <Form onSubmit={(evt)=>handleSaveForm({
          evt,
          onSave,
          form,
          transform: validarUsuario,
          clear: true,
          onClear: setForm(validarUsuario({})),
          clearCache: "usuarios"
        })}
      >
        <Modal.Header closeButton>
          <Modal.Title>{data ? "Editar Usuario" : "Novo Usuario"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
        
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
                formAcesso={form.acesso}
                setFormAcesso={(acesso)=>setForm({...form, acesso})}
              />
            </Tab>
          </Tabs>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="success" type="submit">Salvar</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}