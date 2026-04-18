import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { validarPlanta } from "micro-agricultor";


import AparenciaTab from "../../../components/common/AparenciaTab";
import { EntidadeEstadoAtualTab } from "../../../components/common/EntidadeEstadoAtualTab";

import { handleSaveForm } from "../../../utils/formUtils";

import { PlantaLocalizacaoTab } from "./PlantaLocalizacaoTab";
import { PlantaEspecieTab } from "./PlantaEspecieTab";
import PlantaDadosTab from "./PlantaDadosTab";

export default function PlantaModal({ show, onSave, onClose, data}) {
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Formulário
  const [form, setForm] = useState(validarPlanta(data));
  
  // Sanitiza data
  useEffect(() => { setForm(validarPlanta(data ?? {})); }, [data]);
  
  if (!show) return null;
  return (
  <Modal show onHide={onClose} size="lg">
    <Form onSubmit={(evt)=>handleSaveForm({
        evt,
        onSave,
        form,
        setForm,
        clearCache: "plantas",
      })}
    >
      <Modal.Header closeButton>
        <Modal.Title>{data ? "Editar Planta" : "Nova Planta"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
          <Tabs
            activeKey={tab}
            onSelect={(k) => k && setTab(k)}
            className="mb-3"
          >
            <Tab eventKey="dados" title="Planta">
              <PlantaDadosTab
                form={form}
                setForm={setForm}
              />
            </Tab>
            <Tab eventKey="localizacao" title="Localização">
              <PlantaLocalizacaoTab
                form={form}
                setForm={setForm}
              />
            </Tab>
            <Tab eventKey="especie" title="Espécie">
              <PlantaEspecieTab
                form={form}
                setForm={setForm}
              />
            </Tab>
            <Tab eventKey="aparencia" title="Aparência">
              <AparenciaTab
                formAparencia={form.aparencia}
                setFormAparencia={aparencia => setForm({ ...form, aparencia })} />
            </Tab>
            <Tab eventKey="estadoAtual" title="Estado">
              <EntidadeEstadoAtualTab
                formEstadoAtual={form.estadoAtual ?? {}}
                tipoEntidadeId="planta"
                setFormEstadoAtual={(estadoAtual) => setForm({ ...form, estadoAtual })}
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