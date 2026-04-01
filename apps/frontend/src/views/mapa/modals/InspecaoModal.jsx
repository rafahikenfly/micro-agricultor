import { useState } from "react";
import { Form, Modal, Tab, Tabs } from "react-bootstrap";
import Galeria from "../../../components/Galeria";
import Historico from "../../../components/Historico";
import { useCache } from "../../../hooks/useCache";
import Loading from "../../../components/Loading"
import { StandardCheckboxGroup } from "../../../utils/formUtils"

export default function InspecaoModal({ show, onSave, onClose, data }) {
  const { cacheCaracteristicas, reading } = useCache(["caracteristicas"])
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Formulário
  const [form, setForm] = useState({});

  const selectionCaracteristicas = reading ? [] : (cacheCaracteristicas?.list ?? []).filter(
    (c) => form[c.id]?.selecionado
  );
  if (!show) return null;
  return (
  <Modal show onHide={onClose} size="lg">
    <Form>
      <Modal.Header closeButton>
        <Modal.Title>{data.nome ?? "Nenhuma seleção"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Tabs
          activeKey={tab}
          onSelect={(k) => k && setTab(k)}
          className="mb-3"
        >
          <Tab eventKey="tarefas" title="Tarefas">
            NECESSIDADES/TAREFAS
          </Tab>
          <Tab eventKey="historico" title="Histórico">
            HISTORICO/EVENTOS
          </Tab>
          <Tab eventKey="evolucao" title="Evolução">
            <StandardCheckboxGroup label="Características">
              {reading ? <Loading />
              : (cacheCaracteristicas?.list ?? []).filter((a)=>a.aplicavel[data.tipoEntidadeId]).map((c)=>
                <Form.Check
                  key = {c.id}
                  label = {c.nome}
                  checked = {form[c.id]?.selecionado || false}
                  onChange = {(e)=>setForm({...form, [c.id]: {...form[c.id], selecionado: e.target.checked}})}
                />
                )
              }
            </StandardCheckboxGroup>

            <Historico
              entidades={[data]}
              caracteristicas={selectionCaracteristicas}
            />
          </Tab>
          <Tab eventKey="galeria" title="Galeria">
            <Galeria entidadeId={data.id} />
          </Tab>
        </Tabs>
      </Modal.Body>      
      </Form>
    </Modal>
  )
}