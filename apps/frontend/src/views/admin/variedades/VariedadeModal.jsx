
import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { validarVariedade } from "micro-agricultor";
import { handleSaveForm } from "../../../utils/formUtils";

import AparenciaTab from "../../../components/common/AparenciaTab";

import VariedadeDadosTab from "./VariedadeDadosTab";
import VariedadeCicloAccordion from "./VariedadeCicloAccordion";

export default function VariedadeModal({ show, onSave, onClose, data }) {
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Formulário
  const [form, setForm] = useState(validarVariedade(data));

  // ========== CARREGAR DADOS ==========
  // Sanitiza data
  useEffect(() => { setForm(validarVariedade(data ?? {})); }, [data]);
  
  if (!show) return null;
  return (
    <Modal show onHide={onClose} size="lg">
      <Form onSubmit={(evt)=>handleSaveForm({
          evt,
          onSave,
          form,
          transform: validarVariedade,
          clear: true,
          onClear: setForm(validarVariedade({})),
          clearCache: "variedades"
        })}
      >
        <Modal.Header closeButton>
          <Modal.Title>{data ? "Editar Variedade" : "Nova Variedade"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Tabs
            activeKey={tab}
            onSelect={(k) => k && setTab(k)}
            className="mb-3"
          >
            <Tab eventKey="dados" title="Variedade">
              <VariedadeDadosTab
                form={form}
                setForm={setForm}
              />
            </Tab>
            <Tab eventKey="aparencia" title="Aparência">
              <AparenciaTab
                formAparencia={form.aparencia}
                setFormAparencia={aparencia => setForm({ ...form, aparencia })}
              />
            </Tab>
            <Tab eventKey="ciclo" title= "Ciclo">
              <VariedadeCicloAccordion
                formCiclo={form.ciclo}
                setFormCiclo={(ciclo) => setForm({...form, ciclo})}
                especieId={form.especieId}
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