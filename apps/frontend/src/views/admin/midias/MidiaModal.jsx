import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { validarMidia } from "micro-agricultor";

import { handleSaveForm } from "../../../utils/formUtils";
import MidiaDadosTab from "./MidiaDadosTab";
import { MidiaMetadadosTab } from "./MidiaMetadadosTab";
import { MidiaContextoTab } from "./MidiaContexto";
import MidiaPreviewTab from "./MidiaPreviewTab";
import MidiaExecucaoTab from "./MidiaExecucao";
import MidiaInferenciaTab from "./MidiaInferencia";

export default function MidiaModal({ show, onSave, onClose, data = {}, }) {
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Formulário
  const [form, setForm] = useState(validarMidia(data))
  // Catalogos

  // Sanitiza data
  useEffect(() => { setForm(validarMidia(data ?? {})); }, [data]);  

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
            <Tab eventKey="execucao" title="Visão Computacional">
              <MidiaExecucaoTab
                formExecucao={form.execucao}
                setFormExecucao={(execucao)=>setForm({ ...form, execucao })}
              />
            </Tab>
            <Tab eventKey="inferencia" title="Inferência">
              <MidiaInferenciaTab
                formInferencia={form.inferencia}
                setFormInferencia={(inferencia)=>setForm({ ...form, inferencia })}
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