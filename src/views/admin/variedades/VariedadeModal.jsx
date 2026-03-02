
import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { validarVariedade } from "@domain/variedade.rules";

import { catalogosService } from "../../../services/catalogosService";
import { useToast } from "../../../services/toast/toastProvider";

import { handleSaveForm } from "../../../utils/formUtils";

import AparenciaTab from "../../../components/common/AparenciaTab";

import VariedadeDadosTab from "./VariedadeDadosTab";
import VariedadeCicloAccordion from "./VariedadeCicloAccordion";

export default function VariedadeModal({ show, onSave, onClose, data }) {
  const { toastMessage } = useToast();  
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Catalogos
  const [manejos, setManejos] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [reading, setReading] = useState(false);
  // Formulário
  const [form, setForm] = useState(validarVariedade(data));

  // ========== CARREGAR DADOS ==========
  // Sanitiza data
  useEffect(() => { setForm(validarVariedade(data ?? {})); }, [data]);
  // Carrega catálogos
  useEffect(() => {
    if (!show) return;
    setReading(true);
    let ativo = true;
  
    Promise.all([
      catalogosService.getEspecies(),
      catalogosService.getCaracteristicas(),
      catalogosService.getManejos(),
    ]).then(([esps, carac, mane]) => {
      if (!ativo) return;
      setEspecies(esps);
      setCaracteristicas(carac);
      setManejos(mane);
      setReading(false);
    })
    .catch((err) => {
      console.error("Erro ao carregar catálogos da variedade:", err);
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
        onClear: setForm(validarVariedade({})),
        clearCache:"variedades"
        })}
      >
        <Modal.Header closeButton>
          <Modal.Title>{data ? "Editar Variedade" : "Nova Variedade"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Tabs
            activeKey={tab}
            onSelect={(k) => k && setTab(k)}
            className="mb-3"
          >
            <Tab eventKey="dados" title="Variedade">
                <VariedadeDadosTab
                  form={form}
                  setForm={setForm}
                  especies={especies}
                  loading={reading}
                />
            </Tab>
            <Tab eventKey="aparencia" title="Aparência">
              <AparenciaTab
                formAparencia={form.aparencia}
                setFormAparencia={aparencia => setForm({ ...form, aparencia })}
              />
            </Tab>
            <Tab eventKey="ciclo" title= "Ciclo">
              <VariedadeCicloAccordion
                formCiclo={form.ciclo}
                setFormCiclo={(ciclo) => setForm({...form, ciclo})}
                caracteristicas={caracteristicas}
                manejos={manejos}
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