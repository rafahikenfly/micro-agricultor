import { useState, useEffect } from "react";
import { Modal, Button, Form, Tabs, Tab } from "react-bootstrap";
// import { catalogosService } from "../../services/catalogosService";
import { validarHorta } from "@domain/horta.rules";
import AparenciaTab from "../common/AparenciaTab";
import VerticesTab from "../common/VerticesTab";
import BaseTab from "../common/BaseTab";
import HortaDadosTab from "./HortaDadosTab";
import HortaPosicaoTab from "./HortaPosicaoTab";


export default function HortaModal({ show, onClose, onSave, data, setToast}) {
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Catalogos
  const [reading, setReading] = useState(false);
  // Formulário
  const [form, setForm] = useState(validarHorta(data));

  useEffect(() => {
    if (!data) { setForm(validarHorta({})); }  // nova horta limpa
    else { setForm(validarHorta(data)); }      // edição
  }, [data]);

  useEffect(() => {
    if (!show) return;
  
    let ativo = true;
    setReading(true);
  
    Promise.all([
//      catalogosService.getEstados_planta(),
    ]).then(([plns, ]) => {
      if (!ativo) return;
  
//      setEstados_planta(plns);
    })
    .catch((err) => {
      console.error("Erro ao carregar catálogos da horta:", err);
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
      posicao: {
        lat: Number(form.posicao.lat),
        long: Number(form.posicao.long)
      },
      altitude: Number(form.altitude),
    }, "horta");
  };

  if (!show) return null;

  return (
    <Modal show onHide={onClose} size="lg" backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>Horta</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Tabs
            activeKey={tab}
            onSelect={(k) => setTab(k)}
            className="mb-3"
          >
            <Tab eventKey="dados" title="Dados">
              <HortaDadosTab
                form={form}
                setForm={setForm}
              />
              </Tab>
              <Tab eventKey="posicao" title="Posição">
                <HortaPosicaoTab
                  formPosicao={form.posicao}
                  setFormPosicao={(posicao) => setForm({ ...form, posicao}) }
                />
              </Tab>
            <Tab eventKey="aparencia" title="Aparência">
              <AparenciaTab
                formAparencia={form.aparencia}
                setFormAparencia={(aparencia) => setForm({ ...form, aparencia }) }
              />
            </Tab>
          </Tabs>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={salvar}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
