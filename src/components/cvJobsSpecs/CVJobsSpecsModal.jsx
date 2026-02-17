import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { validarCvJobSpecs } from "../../../shared/domain/cvJobSpecs.rules";
import CvJobSpecsDadosTab from "./CvJobSpecsDadosTab";
import CvJobSpecsModelTab from "./CvJobSpecsModelTab";
import CvJobSpecsPolicyTab from "./CvJobSpecsPolicyTab";
import CvJobSpecsOutputTab from "./CvJobSpecsOutputTab";
import { catalogosService } from "../../services/catalogosService";

export default function CvJobSpecsModal({ show, onSave, onClose, data = {}, }) {
  const [form, setForm] = useState(validarCvJobSpecs(data))
  // Catalogos
  const [reading, setReading] = useState(false);
  const [cvModelos, setCvModelos] = useState([]);
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [estados_planta, setEstados_planta] = useState([]);
  const [estados_canteiro, setEstados_canteiro] = useState([]);

  useEffect(() => {
    if (!data) { setForm(validarCvJobSpecs({})); }  // novo estado limpo
    else { setForm(validarCvJobSpecs(data)); }     // edição
  }, [data]);

  useEffect(() => {
    if (!show) return;
  
    let ativo = true;
    setReading(true);
      Promise.all([
        catalogosService.getEstados_planta(),
        catalogosService.getEstados_canteiro(),
        catalogosService.getCvModelos(),
        catalogosService.getCaracteristicas(),
      ]).then(([plns, cans, cvmd, carac ]) => {
        if (!ativo) return;
    
        setEstados_planta(plns);
        setEstados_canteiro(cans);
        setCvModelos(cvmd);
        setCaracteristicas(carac);
      })
      .catch((err) => {
        console.error("Erro ao carregar catálogos de especificação de cvJob:", err);
        setToast({ body: "Erro ao carregar catálogos.", variant: "danger" });
      })
      .finally(() => {
        if (ativo) setReading(false);
      });
    
      return () => { ativo = false };
  }, [show]);
  
    const salvar = () => {
      onSave({
        ...form,
      });
    };
  
  if (!show) return null;
  return (
    <Modal show onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{data ? "Editar Definição de Tarefa de Visão Computacional" : "Nova Definição de Tarefa de Visão Computacional"}</Modal.Title>
      </Modal.Header>

        <Modal.Body>
          <Form onSubmit={salvar}>

            <Form.Group className="mb-3">
            <Tabs defaultActiveKey="dados">
              <Tab eventKey="dados" title="Dados">
                <CvJobSpecsDadosTab
                  form={form}
                  setForm={setForm}
                />
              </Tab>
              <Tab eventKey="model" title="Modelo">
                <CvJobSpecsModelTab
                  formModel={form.model}
                  setFormModel={(model)=>setForm(prev => ({...prev, model,}))}
                  loading={reading}
                  cvModelos={cvModelos}
                />
              </Tab>
              <Tab eventKey="policy" title="Política">
                <CvJobSpecsPolicyTab
                  form={form.routingPolicy}
                  setForm={(d)=>setForm({...form, routingPolicy})}
                />
              </Tab>
              <Tab eventKey="output" title="Saída">
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
            </Form.Group>


          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="success" onClick={salvar}>Salvar</Button>
        </Modal.Footer>
      </Modal>
    )
}