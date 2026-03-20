import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { validarMidia } from "micro-agricultor";

import { handleSaveForm } from "../../../utils/formUtils";
import MidiaDadosTab from "./MidiaDadosTab";
import { MidiaMetadadosTab } from "./MidiaMetadadosTab";
import { MidiaContextoTab } from "./MidiaContexto";
import MidiaPreviewTab from "./MidiaPreviewTab";
import { catalogosService } from "../../../services/catalogosService";


export default function MidiaModal({ show, onSave, onClose, data = {}, }) {
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Formulário
  const [form, setForm] = useState(validarMidia(data))
  // Catalogos
  const [catalogoPlantas, setCatalogoPlantas] = useState({});
  const [catalogoCanteiros, setCatalogoCanteiros] = useState({});
  const [reading, setReading] = useState(false);


  // Sanitiza data
  useEffect(() => { setForm(validarMidia(data ?? {})); }, [data]);
  // Carrega catálogos
  useEffect(() => {
    if (!show) return;
  
    let ativo = true;
    setReading(true);
  
    Promise.all([
      catalogosService.getPlantas(),
      catalogosService.getCanteiros(),
    ]).then(([plant, cant]) => {
      if (!ativo) return;
      setCatalogoPlantas(plant);
      setCatalogoCanteiros(cant);
    })
    .catch((err) => {
      console.error("Erro ao carregar catálogos de mídias:", err);
      toastMessage({
        body: "Erro ao carregar catálogos.",
        variant: VARIANT_TYPES.RED,
      });
    })
    .finally(() => {
      if (ativo) setReading(false);
    });
  
    return () => { ativo = false };
  }, [show]);
  

  if (!show) return null;
  return (
    <Modal show onHide={onClose} size="lg">
      <Form onSubmit={(evt)=>handleSaveForm({
          evt,
          onSave,
          form,
          clear: true,
          onClear: ()=>setForm(validarMidia({})),
          clearCache: "midia",
        })}>
        <Modal.Header closeButton>
          <Modal.Title>{data ? "Editar Mídia" : "Nova Mídia"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Tabs
            activeKey={tab}
            onSelect={(k) => k && setTab(k)}
            className="mb-3"
          >
            <Tab eventKey="dados" title="Mídia">
              <MidiaDadosTab
                form={form}
                setForm={setForm}
              />
            </Tab>
            <Tab eventKey="contexto" title="Contexto">
              <MidiaContextoTab
                formContexto={form.contexto}
                setFormContexto={(contexto)=>setForm({...form, contexto})}
                catalogoCanteiros = {catalogoCanteiros}
                catalogoPlantas = {catalogoPlantas}
                loading = {reading}
              />
            </Tab>
            <Tab eventKey="preview" title="Preview">
                <MidiaPreviewTab
                  midia = {form}
                  setForm = {setForm}
                />
            </Tab>
            <Tab eventKey="meta" title="Metadados">
              <MidiaMetadadosTab
                formMetadados={form.metadados}
                setFormMetadados={(metadados)=>setForm({ ...form, metadados })}
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