import { useState, useEffect } from "react";
import { Modal, Tabs, Tab, Button, Form } from "react-bootstrap";
import { validarManejo } from "micro-agricultor";

import { catalogosService } from "../../../services/catalogosService";

import { handleSaveForm } from "../../../utils/formUtils";

import ManejoDadosTab from "./ManejoDadosTab";
import ManejoEfeitosTab from "./ManejoEfeitosTab";
import ManejoEntradasTab from "./ManejoEntradas";

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
  // ========== CARREGAR DADOS ==========
  // Sanitiza data
  useEffect(() => { setForm(validarManejo(data ?? {})); }, [data]);
  // Carrega catálogos
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
      setCaracteristicas(carac.list);
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

  if (!show) return null;
  return (
    <Modal show onHide={onClose} size="lg">
      <Form onSubmit={(evt)=>handleSaveForm({
          evt,
          onSave,
          form,
          transform: validarManejo,
          clear: true,
          onClear: setForm(validarManejo({})),
          clearCache:"manejos"
        })}
      >
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

            {form.temEfeitos && <Tab
              eventKey="efeitos"
              title="Efeitos"
            >
              <ManejoEfeitosTab 
                formEfeitos={form.efeitos || []}
                setFormEfeitos={(efeitos) => setForm({ ...form, efeitos })}
                caracteristicas={caracteristicas.filter(c =>
                  Object.entries(form.aplicavel)
                    .some(([key, value]) => value === true && c.aplicavel?.[key] === true)
                )}
                loading={reading}
              />
            </Tab>}

            {form.temEntradas && <Tab
              eventKey="entradas"
              title="Entradas"
            >
              <ManejoEntradasTab
                formEntradas={form.entradas}
                setFormEntradas={(entradas) => setForm({ ...form, entradas })}
                loading={reading}
            />
            </Tab>}
          </Tabs>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="success" type="submit">Salvar</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
