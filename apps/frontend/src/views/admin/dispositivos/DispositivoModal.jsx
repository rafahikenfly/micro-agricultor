import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { validarDispositivo } from "micro-agricultor";

import { handleSaveForm } from "../../../utils/formUtils";
import { DispositivoDadosTab } from "./DispositivoDadosTab";
import { DispositivosSensoresTab } from "./DispositivoSensoresTab";
import { DispositivosAtuadoresTab } from "./DispositivoAtuadoresTab";
import { DispositivoLocalizacaoTab } from "./DispositivoLocalizacaoTab";
import { useCache } from "../../../hooks/useCache";


export default function DispositivoModal({ show, onSave, onClose, data = {}, }) {
  // Controle de tab
  const [tab, setTab] = useState("dados");
  const [form, setForm] = useState(validarDispositivo(data))
  
  const { cacheHortas, reading } = useCache([
    "hortas",
  ]);

  // Sanitiza data
  useEffect(() => { setForm(validarDispositivo(data ?? {})); }, [data]);
    
  if (!show) return null;
  return (
    <Modal show onHide={onClose} size="lg">
      <Form onSubmit={(evt)=>handleSaveForm({
          evt,
          onSave,
          form,
          transform: validarDispositivo,
          clearCache: "dispositivos",
          setForm,
        })}
      >
        <Modal.Header closeButton>
          <Modal.Title>{data ? "Editar Dispositivo" : "Novo Dispositivo"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Tabs
            activeKey={tab}
            onSelect={(k) => k && setTab(k)}
            className="mb-3"
          >
            <Tab eventKey="dados" title="Dispositivo">
              <DispositivoDadosTab
                form={form}
                setForm={setForm}
              />
            </Tab>
            <Tab eventKey="localizacao" title="Localização">
              <DispositivoLocalizacaoTab
                form={form}
                setForm={setForm}
                hortas={cacheHortas}
                loading={reading}
              />
            </Tab>
            <Tab eventKey="sensores" title="Sensores">
              <DispositivosSensoresTab
                formSensores={form.sensores ?? []}
                setFormSensores={(sensores)=>setForm({...form, sensores})}
              />
            </Tab>
            <Tab eventKey="atuadores" title="Atuadores">
              <DispositivosAtuadoresTab
                formAtuadores={form.atuadores ?? []}
                setFormAtuadores={(atuadores)=>setForm({...form, atuadores})}
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