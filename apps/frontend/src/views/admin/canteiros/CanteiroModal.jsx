import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { validarObjetoCanteiro } from "micro-agricultor";

import { catalogosService } from "../../../services/catalogosService";
import { useToast } from "../../../services/toast/toastProvider";

import AparenciaTab from "../../../components/common/AparenciaTab";
import { EntidadeEstadoAtualTab } from "../../../components/common/EntidadeEstadoAtualTab";

import { handleSaveForm } from "../../../utils/formUtils";

import { CanteiroLocalizacaoTab } from "./CanteiroLocalizacaoTab";
import CanteiroDadosTab from "./CanteiroDadosTab";

export default function CanteiroModal({ show, onSave, onClose, data }) {
  const { toastMessage } = useToast();  
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Catalogos
  const [estados_canteiro, setEstados_canteiro] = useState([]);
  const [hortas, setHortas] = useState([]);
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [reading, setReading] = useState(false);
  // Formulário
  const [form, setForm] = useState(() => validarObjetoCanteiro(data ?? {}));

  // ========== CARREGAR DADOS ==========
  // Sanitiza data
  useEffect(() => { setForm(validarObjetoCanteiro(data ?? {})); }, [data]);
  // Carrega catálogos
  useEffect(() => {
    if (!show) return;
  
    let ativo = true;
    setReading(true);
  
    Promise.all([
      catalogosService.getEstados_canteiro(),
      catalogosService.getHortas(),
      catalogosService.getCaracteristicas(),
    ]).then(([estc, hort, carac]) => {
      if (!ativo) return;
      setEstados_canteiro(estc);
      setHortas(hort);
      setCaracteristicas(carac.list);
    })
    .catch((err) => {
      console.error("Erro ao carregar catálogos do canteiro:", err);
      toastMessage({
        body: "Erro ao carregar catálogos.",
        variant: "warning"
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
              estadosCanteiro={estados_canteiro}
              loading={reading}
            />
          </Tab>
          <Tab eventKey="localizacao" title="Localização">
            <CanteiroLocalizacaoTab
              form={form}
              setForm={setForm}
              hortas={hortas}
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
              caracteristicas={caracteristicas}
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