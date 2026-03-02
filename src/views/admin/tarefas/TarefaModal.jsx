import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { validarTarefa } from "@domain/tarefa.rules";
import { VARIANT_TYPES } from "@shared/types/VARIANT_TYPES";

import { catalogosService } from "../../../services/catalogosService";
import { useToast } from "../../../services/toast/toastProvider";

import { handleSaveForm } from "../../../utils/formUtils";

import TarefaDadosTab from "./TarefaDadosTab";
import TarefaContextoTab from "./TarefaContextoTab";
import TarefaPlanejamentoTab from "./TarefaPlanejamentoTab";

export default function TarefaModal({ show, onSave, onClose, data }) {
  const { toastMessage } = useToast();  
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Catalogos
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [reading, setReading] = useState(false);
  // Formulário
  const [form, setForm] = useState(validarTarefa(data));

  // ========== CARREGAR DADOS ==========
  // Sanitiza data
  useEffect(() => { setForm(validarTarefa(data ?? {})); }, [data]);
  // Carrega catálogos
  useEffect(() => {
    if (!show) return;
  
    let ativo = true;
    setReading(true);
  
    Promise.all([
      catalogosService.getCaracteristicas(),
    ]).then(([carac, ]) => {
      if (!ativo) return;
      setCaracteristicas(carac);
    })
    .catch((err) => {
      console.error("Erro ao carregar catálogos da planta:", err);
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
                caracteristicas={caracteristicas}
                loading={reading}
              />
            </Tab>
            <Tab eventKey="planejamento" title="Planejamento">
              <TarefaPlanejamentoTab
                formPlanejamento={form.planejamento}
                setFormPlanejamento={(planejamento)=>setForm({...form, planejamento})}
              />
            </Tab>
            <Tab eventKey="resolucao" title="Resolução">
                Resolucao
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