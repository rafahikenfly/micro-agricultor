import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { validarEspecie, VARIANT_TYPES } from "micro-agricultor";

import { catalogosService } from "../../../services/catalogosService";
import { useToast } from "../../../services/toast/toastProvider";
import { useCache } from "../../../hooks/useCache";

import AparenciaTab from "../../../components/common/AparenciaTab";

import { handleSaveForm } from "../../../utils/formUtils";

import EspecieDadosTab from "./EspecieDadosTab";
import EspecieCicloTab from "./EspecieCicloTab";

export default function EspecieModal({ show, onSave, onClose, data }) {
  const { toastMessage } = useToast();  
  const { cacheCategoriasEspecie, cacheEstagiosEspecie, reading } = useCache([
    "categoriasEspecie",
  ]);
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Formulário
  const [form, setForm] = useState(validarEspecie(data));

  // ========== CARREGAR DADOS ==========
  // Sanitiza data
  useEffect(() => { setForm(validarEspecie(data ?? {})); }, [data]);
  // Carrega catálogos
  useEffect(() => {
    if (!show) return;
  
    let ativo = true;
  
    Promise.all([
      catalogosService.getCategorias_especie(),
      catalogosService.getEstagios_especie(),
    ]).then(([cate, este]) => {
      if (!ativo) return;
      setCategorias_especie(cate);
      setEstagios_especie(este);
      setReading(false);
    })
    .catch((err) => {
      console.error("Erro ao carregar catálogos da espécie:", err);
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
        onClear: setForm(validarEspecie({})),
        clearCache: "especies",
      })}
    >
      <Modal.Header closeButton>
        <Modal.Title>{data ? "Editar Espécie" : "Nova Espécie"}</Modal.Title>
      </Modal.Header>

        <Modal.Body>
          <Tabs
            activeKey={tab}
            onSelect={(k) => k && setTab(k)}
            className="mb-3"
          >
            <Tab eventKey="dados" title="Espécie">
              <EspecieDadosTab
                form={form}
                setForm={setForm}
                categorias_especie={cacheCategoriasEspecie?.list}
                loading={reading}
              />
            </Tab>
            <Tab eventKey="ciclo" title="Ciclo">
              <EspecieCicloTab
                ciclo={form.ciclo}
                setCiclo={ciclo => setForm({ ...form, ciclo })}
                estagios={cacheEstagiosEspecie?.list}
                loading={reading}
              />
            </Tab>
            <Tab eventKey="aparencia" title="Aparência Padrão">
              <AparenciaTab
                formAparencia={form.aparencia}
                setFormAparencia={(aparencia) => setForm({ ...form, aparencia })} />
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