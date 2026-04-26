import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { validarEspecie } from "micro-agricultor";

import { useCache } from "../../../hooks/useCache";

import AparenciaTab from "../../../components/common/AparenciaTab";

import { handleSaveForm } from "../../../utils/formUtils";

import EspecieDadosTab from "./EspecieDadosTab";
import EspecieCicloTab from "./EspecieCicloTab";

export default function EspecieModal({ show, onSave, onClose, data }) {
  const { cacheCategoriasEspecie, cacheEstagiosEspecie, reading } = useCache([
    "categoriasEspecie",
  ]);
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Formulário
  const [form, setForm] = useState(validarEspecie(data));

  // ========== CARREGAR DADOS ==========
  // Sanitiza data
  useEffect(() => { setForm(validarEspecie(data ?? {})); }, [data]);
  
  if (!show) return null;
  return (
  <Modal show onHide={onClose} size="lg">
    <Form onSubmit={(evt)=>handleSaveForm({
        evt,
        onSave,
        form,
        clear: true,
        onClear: setForm(validarEspecie({})),
        clearCache: "especies",
      })}
    >
      <Modal.Header closeButton>
        <Modal.Title>{data ? "Editar Espécie" : "Nova Espécie"}</Modal.Title>
      </Modal.Header>

        <Modal.Body>
          <Tabs
            activeKey={tab}
            onSelect={(k) => k && setTab(k)}
            className="mb-3"
          >
            <Tab eventKey="dados" title="Espécie">
              <EspecieDadosTab
                form={form}
                setForm={setForm}
              />
            </Tab>
            <Tab eventKey="ciclo" title="Ciclo">
              <EspecieCicloTab
                formCiclo={form.ciclo}
                setFormCiclo={ciclo => setForm({ ...form, ciclo })}
              />
            </Tab>
            <Tab eventKey="aparencia" title="Aparência Padrão">
              <AparenciaTab
                formAparencia={form.aparencia}
                setFormAparencia={(aparencia) => setForm({ ...form, aparencia })} />
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