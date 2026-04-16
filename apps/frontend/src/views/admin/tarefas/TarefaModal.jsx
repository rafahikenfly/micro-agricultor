import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { validarTarefa, } from "micro-agricultor";

import { handleSaveForm } from "../../../utils/formUtils";

import TarefaDadosTab from "./TarefaDadosTab";
import TarefaContextoTab from "./TarefaContextoTab";
import TarefaPlanejamentoTab from "./TarefaPlanejamentoTab";
import TarefaExecucaoTab from "./TarefaExecucaoTab";
import TarefaResolucaoTab from "./TarefaResolucao";
import AparenciaTab from "../../../components/common/AparenciaTab";

export default function TarefaModal({ show, onSave, onClose, data }) {

  // Controle de tab
  const [tab, setTab] = useState("dados");
  
  // Formulário
  const [form, setForm] = useState(validarTarefa(data));

  // ========== CARREGAR DADOS ==========
  // Sanitiza data
  useEffect(() => { setForm(validarTarefa(data ?? {})); }, [data]);

  if (!show) return null;
  return (
    <Modal show onHide={onClose} size="lg">
      <Form onSubmit={(evt)=>handleSaveForm({
          evt,
          onSave,
          form,
          setForm,
          clearCache:"tarefas"
        })}
      >
        <Modal.Header closeButton>
          <Modal.Title>{data ? "Editar Tarefa" : "Nova Tarefa"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Tabs
            activeKey={tab}
            onSelect={(k) => k && setTab(k)}
            className="mb-3"
          >
            <Tab eventKey="dados" title="Tarefa">
              <TarefaDadosTab
                form={form}
                setForm={setForm}
              />
            </Tab>
            <Tab eventKey="contexto" title="Contexto">
              <TarefaContextoTab
                formContexto={form.contexto}
                setFormContexto={(contexto)=>setForm({...form, contexto})}
              />
            </Tab>
            <Tab eventKey="planejamento" title="Planejamento">
              <TarefaPlanejamentoTab
                formPlanejamento={form.planejamento}
                setFormPlanejamento={(planejamento)=>setForm({...form, planejamento})}
              />
            </Tab>
            <Tab eventKey="execucao" title="Execução">
              <TarefaExecucaoTab
                formExecucao={form.execucao}
                setFormExecucao={(execucao)=>setForm({...form, execucao})}
              />
            </Tab>
            <Tab eventKey="resolucao" title="Resolução">
              <TarefaResolucaoTab
                formResolucao={form.resolucao}
                setFormResolucao={(resolucao)=>setForm({...form, resolucao})}
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