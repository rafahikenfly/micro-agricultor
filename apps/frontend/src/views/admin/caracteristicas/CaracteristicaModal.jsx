import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { validarCaracteristica } from "micro-agricultor";

import { handleSaveForm } from "../../../utils/formUtils";
import CaracteristicaDados from "./CaracteristicaDados";
import CaracteristicaMedida from "./CaracteristicaMedida";
import CaracteristicaSensor from "./CaracteristicaSensor";


export default function CaracteristicaModal({ show, onSave, onClose, data = {}, }) {
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Formulário
  const [form, setForm] = useState(validarCaracteristica(data))

  // Sanitiza data
  useEffect(() => { setForm(validarCaracteristica(data ?? {})); }, [data]);

  if (!show) return null;
  return (
    <Modal show onHide={onClose} size="lg">
      <Form onSubmit={(evt)=>handleSaveForm({
          evt,
          onSave,
          form,
          clear: true,
          onClear: ()=>setForm(validarCaracteristica({})),
          clearCache: "caracteristicas",
        })}>
        <Modal.Header closeButton>
          <Modal.Title>{data ? "Editar Característica" : "Nova Característica"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Tabs
            activeKey={tab}
            onSelect={(k) => k && setTab(k)}
            className="mb-3"
          >
            <Tab eventKey="dados" title="Característica">
              <CaracteristicaDados
                form = {form}
                setForm = {setForm}
              />
            </Tab>
            <Tab eventKey="medida" title="Medida">
              <CaracteristicaMedida
                form = {form}
                setForm = {setForm}
              />
            </Tab>
            <Tab eventKey="sensor" title="Sensores">
              <CaracteristicaSensor
                form = {form}
                setForm = {setForm}
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