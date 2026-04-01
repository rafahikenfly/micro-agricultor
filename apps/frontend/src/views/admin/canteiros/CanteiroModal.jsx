import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { validarObjetoCanteiro } from "micro-agricultor";


import AparenciaTab from "../../../components/common/AparenciaTab";
import { EntidadeEstadoAtualTab } from "../../../components/common/EntidadeEstadoAtualTab";

import { handleSaveForm } from "../../../utils/formUtils";

import { CanteiroLocalizacaoTab } from "./CanteiroLocalizacaoTab";
import CanteiroDadosTab from "./CanteiroDadosTab";
import { useCache } from "../../../hooks/useCache";

export default function CanteiroModal({ show, onSave, onClose, data }) {
  const { cacheEstadosCanteiro, cacheHortas, cacheCaracteristicas, reading } = useCache([
    "estadosCanteiro",
    "hortas",
    "caracteristicas"
  ]);
  const [tab, setTab] = useState("dados");
  const [form, setForm] = useState(() => validarObjetoCanteiro(data ?? {}));

  // Sanitiza data
  useEffect(() => { setForm(validarObjetoCanteiro(data ?? {})); }, [data]);
  
  if (!show) return null;
  return (
  <Modal show onHide={onClose} size="lg">
    <Form onSubmit={(evt)=>handleSaveForm({
        evt,
        onSave,
        form,
        setForm,
        clearCache: "canteiros",
      })}
    >
      <Modal.Header closeButton>
        <Modal.Title>{data ? "Editar Canteiro" : "Novo Canteiro"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Tabs
          activeKey={tab}
          onSelect={(k) => k && setTab(k)}
          className="mb-3"
        >
          <Tab eventKey="dados" title="Canteiro">
            <CanteiroDadosTab
              form={form}
              setForm={setForm}
              estadosCanteiro={cacheEstadosCanteiro}
              loading={reading}
            />
          </Tab>
          <Tab eventKey="localizacao" title="Localização">
            <CanteiroLocalizacaoTab
              form={form}
              setForm={setForm}
              hortas={cacheHortas}
              loading={reading}
            />
          </Tab>
          <Tab eventKey="aparencia" title="Aparência">
            <AparenciaTab
              formAparencia={form.aparencia}
              setFormAparencia={(aparencia) => setForm({ ...form, aparencia })}
            />
          </Tab>
          <Tab eventKey="estadoAtual" title="Estado">
            <EntidadeEstadoAtualTab
              tipoEntidadeId="canteiro"
              caracteristicas={cacheCaracteristicas}
              formEstadoAtual={form.estadoAtual ?? {}}
              setFormEstadoAtual={(estadoAtual) => setForm({ ...form, estadoAtual })}
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