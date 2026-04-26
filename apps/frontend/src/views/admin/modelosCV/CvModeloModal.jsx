import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { validarModeloCV } from "micro-agricultor";
import CvModeloDadosTab from "./CvModeloDados"
import CvModeloClassesTab from "./CvModeloClassesTab";
import { handleSaveForm } from "../../../utils/formUtils";

export default function CvModeloModal({ show, onSave, onClose, data = {}, }) {
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Formulário
  const [form, setForm] = useState(validarModeloCV(data))
  
  // ========== CARREGAR DADOS ==========
  // Sanitiza data
  useEffect(() => { setForm(validarModeloCV(data ?? {})); }, [data]);
  
  if (!show) return null;
  return (
    <Modal show onHide={onClose} size="lg">
      <Form onSubmit={(evt)=>handleSaveForm({
          evt,
          onSave,
          form,
          setForm,
          clearCache:"modelosCv"
        })}
      >
        <Modal.Header closeButton>
          <Modal.Title>{data ? "Editar Modelo de Visão Computacional" : "Novo Modelo de Visão Computacional"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Tabs
            activeKey={tab}
            onSelect={(k) => k && setTab(k)}
            className="mb-3"
          >
            <Tab eventKey="dados" title="Modelo">
                <CvModeloDadosTab
                  form={form}
                  setForm={setForm}
                />
              </Tab>
              <Tab eventKey="classes" title="Classes">
                <CvModeloClassesTab
                  formClasses={form.classes}
                  setFormClasses={(classes)=>setForm({...form, classes})}
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