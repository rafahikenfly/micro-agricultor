import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { validarTarefa, VARIANT_TYPES } from "micro-agricultor";

import { catalogosService } from "../../../services/catalogosService";
import { useToast } from "../../../services/toast/toastProvider";

import { handleSaveForm } from "../../../utils/formUtils";

import TarefaDadosTab from "./TarefaDadosTab";
import TarefaContextoTab from "./TarefaContextoTab";
import TarefaPlanejamentoTab from "./TarefaPlanejamentoTab";
import TarefaResolucaoTab from "./TarefaResolucao";

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
            <Tab eventKey="resolucao" title="Resolução">
              <TarefaResolucaoTab
                formResolucao={form.resolucao}
                setFormResolucao={(resolucao)=>setForm({...form, resolucao})}
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