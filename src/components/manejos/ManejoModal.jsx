import { useState, useEffect } from "react";
import { Modal, Tabs, Tab, Button } from "react-bootstrap";
import { catalogosService } from "../../services/catalogosService";
import { validarManejo } from "@domain/manejo.rules";
import ManejoDadosTab from "./ManejoDadosTab";
import ManejoEfeitosTab from "./ManejoEfeitosTab";
import EntradasTab from "../common/EntradasTab";

export default function ManejoModal({ show, onSave, onClose, data = {}, setToast}) {
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Catalogos
  const [estados_planta, setEstados_planta] = useState([]);
  const [estados_canteiro, setEstados_canteiro] = useState([]);
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [reading, setReading] = useState(false);
  // Formulário
  const [form, setForm] = useState(validarManejo(data));

  useEffect(() => {
    if (data) setForm(validarManejo(data));
  }, [data]);

  useEffect(() => {
    if (!show) return;
  
    let ativo = true;
    setReading(true);
  
    Promise.all([
      catalogosService.getEstados_planta(),
      catalogosService.getEstados_canteiro(),
      catalogosService.getCaracteristicas(),
    ]).then(([plns, cans, carac, ]) => {
      if (!ativo) return;
  
      setEstados_planta(plns);
      setEstados_canteiro(cans);
      setCaracteristicas(carac);
    })
    .catch((err) => {
      console.error("Erro ao carregar catálogos do manejo:", err);
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
    }, "manejo");
  };

  if (!show) return null;
  return (
    <Modal show onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{data ? "Editar Manejo" : "Novo Manejo"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Tabs
          activeKey={tab}
          onSelect={(k) => setTab(k)}
          className="mb-3"
        >
          <Tab eventKey="dados" title="Dados">
            <ManejoDadosTab
              form={form}
              setForm={setForm}
              estados_canteiro={estados_canteiro}
              estados_planta={estados_planta}
              loading={reading}
            />
          </Tab>

          <Tab
            eventKey="efeitos"
            title="Efeitos"
            disabled={!form.temEfeitos ?? true}
          >
            <ManejoEfeitosTab 
              efeitos={form.efeitos || []}
              onChange={efeitos => setForm({ ...form, efeitos }) }
              caracteristicas={caracteristicas.filter(c => c.aplicavel?.[form.tipoEntidade] === true)}
              loading={reading}
            />
          </Tab>

          <Tab
            eventKey="entradas"
            title="Entradas"
            disabled={!form.requerEntrada ?? true}
          >
            <EntradasTab
              value={form.entradas}
              onChange={entradas =>
                setForm({ ...form, entradas })
              }
           />
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="success" onClick={salvar}>Salvar</Button>
      </Modal.Footer>
    </Modal>
  );
}
