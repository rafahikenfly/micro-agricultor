import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import CvSpecDadosTab from "./CvSpecDadosTab";
import CvJobSpecsPolicyTab from "./CvJobSpecsPolicyTab";
import CvJobSpecsOutputTab from "./CvJobSpecsOutputTab";
import { catalogosService } from "../../services/catalogosService";
import { useCatalogos } from "../../../hooks/useCatalogos";
import { validarCvSpecs } from "micro-agricultor";

export default function CvJobSpecsModal({ show, onSave, onClose, data = {}, }) {
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Formulário
  const [form, setForm] = useState(validarCvSpecs(data))
  const { cvModelos, caracteristicas, estados_planta, estados_canteiro, reading} = useCatalogos(["cvModelos", "caracteristicas", "estados_planta", "estados_canteiro"])

  // Sanitiza data
  useEffect(() => { setForm(validarCvJobSpecs(data));}, [data]);
  
  if (!show) return null;
  return (
    <Modal show onHide={onClose} size="lg">
      <Form onSubmit={(evt)=>handleSaveForm({
          evt,
          onSave,
          form,
          clear: true,
          onClear: ()=>setForm(validarCvSpecs({})),
          clearCache: "cvSpecs",
        })}
      >
        <Modal.Header closeButton>
          <Modal.Title>{data ? "Editar Definição de Tarefa de Visão Computacional" : "Nova Definição de Tarefa de Visão Computacional"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Tabs defaultActiveKey="dados">
            <Tab eventKey="dados" title="Dados">
              <CvSpecDadosTab
                form={form}
                setForm={setForm}
              />
            </Tab>
            <Tab eventKey="model" title="Modelo">
              <CvSpecsModeloTab
                formModel={form.model}
                setFormModel={(model)=>setForm(prev => ({...prev, model,}))}
                loading={reading}
                cvModelos={cvModelos}
              />
            </Tab>
            <Tab eventKey="policy" title="Inferência">
              <CvJobSpecsPolicyTab
                form={form.routingPolicy}
                setForm={(d)=>setForm({...form, routingPolicy})}
              />
            </Tab>
            <Tab eventKey="output" title="Resultado">
              <CvJobSpecsOutputTab
                modelType={form.model.modelType}
                formOutput={form.output}
                setFormOutput={(output)=>setForm(prev => ({...prev, output,}))}
                estados={[...estados_canteiro, ...estados_planta]}
                caracteristicas={caracteristicas}
                classes={cvModelos.find((m)=>m.nome===form.model?.modelId)?.classes || []}
                loading={reading}
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