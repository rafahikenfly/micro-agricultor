import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { validarCvModelo } from "@domain/cvModelo.rules";
import CvModeloDadosTab from "./CvModeloDados"
import CvModeloClassesTab from "./CvModeloClassesTab";

export default function CvModeloModal({ show, onSave, onClose, data = {}, }) {
  // Controle de tab
  const [tab, setTab] = useState("dados");

  const [form, setForm] = useState(validarCvModelo(data))
  
  useEffect(() => {
    if (!data) { setForm(validarCvModelo({})); } // novo modelo limpo
    else { setForm(validarCvModelo(data)); }     // edição
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
        <Modal.Title>{data ? "Editar Modelo de Visão Computacional" : "Novo Modelo de Visão Computacional"}</Modal.Title>
      </Modal.Header>

        <Modal.Body>
          <Form onSubmit={salvar}>
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