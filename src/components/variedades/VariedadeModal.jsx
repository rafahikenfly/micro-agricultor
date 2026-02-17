
import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { catalogosService } from "../../services/catalogosService";
import VariedadeDadosTab from "./VariedadesDadosTab";
import VariedadeCicloAccordion from "./VariedadeCicloAccordion";
import AparenciaTab from "../common/AparenciaTab";
import VerticesTab from "../common/VerticesTab";
import { validarVariedade } from "@domain/variedades.rules";

export default function VariedadeModal({ show, onSave, onClose, data, setToast, restrito = false}) {
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Catalogos
  const [manejos, setManejos] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [reading, setReading] = useState(false);
  // Formulário
  const [form, setForm] = useState(validarVariedade(data));

  useEffect(() => {
    if (!data) {
      setForm(validarVariedade({}));   // nova variedade limpa
    } else {
      setForm(validarVariedade(data)); // edição
    }
  }, [data]);

    // ========== CARREGAR DADOS ==========
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
      setToast({ body: "Erro ao carregar catálogos.", variant: "danger" });
    })
    .finally(() => {
      if (ativo) setReading(false);
    });
  
    return () => { ativo = false };
  }, [show]);


  const salvar = () => {
    console.log(form)
    onSave({
      ...form,
    }, "variedade");
  };
  
  if (!show) return null;
  return (
  <Modal show onHide={onClose} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>{data ? "Editar Variedade" : "Nova Variedade"}</Modal.Title>
    </Modal.Header>

      <Modal.Body>
        <Form onSubmit={salvar}>

          <Tabs
            activeKey={tab}
            onSelect={(k) => k && setTab(k)}
            className="mb-3"
          >
            <Tab eventKey="dados" title="Espécie">
                <VariedadeDadosTab
                  form={form}
                  setForm={setForm}
                  especies={especies}
                  loading={reading}
                />
            </Tab>
            <Tab eventKey="aparencia" title="Aparência">
              <AparenciaTab
                value={form.aparencia}
                onChange={aparencia => setForm({ ...form, aparencia })}
              />
            </Tab>
            <Tab eventKey="vertices" title="Vértices" disabled={form.aparencia.geometria !== "polygon"}>
              <VerticesTab
                value={form.aparencia?.vertices}
                onChange={vertices => setForm(prev => ({...prev, aparencia: {...prev.aparencia,vertices}}))}
              />
            </Tab>
            <Tab eventKey="ciclo" title= "Ciclo">
              <VariedadeCicloAccordion
                data={form.ciclo}
                onChange={ciclo => setForm({...form, ciclo: ciclo})}
                caracteristicas={caracteristicas}
                manejos={manejos}
                loading={reading}
              />
            </Tab>
          </Tabs>
        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="success" onClick={salvar}>Salvar</Button>
      </Modal.Footer>
    </Modal>
  )
}