import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { catalogosService } from "../../services/catalogosService";
import EspecieDadosTab from "./EspeciesDadosTab";
import EspecieEstagiosTab from "./EspecieEstagiosTab";
import AparenciaTab from "../common/AparenciaTab";
import VerticesTab from "../common/VerticesTab";
import { validarEspecie } from "../../domain/especie.rules";

export default function EspecieModal({ show, onSave, onClose, data, setToast, restrito = false}) {
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Catalogos
  const [categorias_especie, setCategorias_especie] = useState([]);
  const [estagios_especie, setEstagios_especie] = useState([]);
  const [reading, setReading] = useState(false);
  // Formulário
  const [form, setForm] = useState(validarEspecie(data));

  useEffect(() => {
    if (!data) {
      setForm(validarEspecie({}));   // nova espécie limpa
    } else {
      setForm(validarEspecie(data)); // edição
    }
  }, [data]);

    // ========== CARREGAR DADOS ==========
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
    }, "especie");
  };
  
  if (!show) return null;
  return (
  <Modal show onHide={onClose} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>{data ? "Editar Espécie" : "Nova Espécie"}</Modal.Title>
    </Modal.Header>

      <Modal.Body>
        <Form onSubmit={salvar}>

          <Tabs
            activeKey={tab}
            onSelect={(k) => k && setTab(k)}
            className="mb-3"
          >
            <Tab eventKey="dados" title="Espécie">
              <EspecieDadosTab
                form={form}
                setForm={setForm}
                categorias_especie={categorias_especie}
                loading={reading}
              />
            </Tab>
            <Tab eventKey="ciclo" title="Ciclo">
              <EspecieEstagiosTab
                value={form.ciclo}
                onChange={ciclo => setForm({ ...form, ciclo })}
                estagios={estagios_especie}
                loading={reading}
              />
            </Tab>
            <Tab eventKey="aparencia" title="Aparência Padrão">
              <AparenciaTab value={form.aparencia} onChange={aparencia => setForm({ ...form, aparencia })} />
            </Tab>
            <Tab eventKey="vertices" title="Vértices">
              <VerticesTab value={form.aparencia?.vertices} onChange={vertices => setForm(prev => ({...prev, aparencia: {...prev.aparencia,vertices}}))} />
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