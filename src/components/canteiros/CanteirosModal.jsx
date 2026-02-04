import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import CanteiroDadosTab from "./CanteiroDadosTab";
import AparenciaTab from "../common/AparenciaTab";
import VerticesTab from "../common/VerticesTab";
import VetorTab from "../common/PosicaoTab";
import CanteiroSistemaTab from "./CanteiroSistemaTab";
import { catalogosService } from "../../services/catalogosService";

export default function CanteirosModal({ show, onSave, onClose, data, restrito = false}) {
  const [tab, setTab] = useState("dados");
  const [form, setForm] = useState({aparencia: {}, posicao: {}, dimensao: {}});
  const [estados_canteiro, setEstados_canteiro] = useState([]);
  const [reading, setReading] = useState(false);

  useEffect(() => {
      if (data) setForm(data);
    }, [data]);

    // ========== CARREGAR DADOS ==========
  useEffect(() => {
    if (!show) return;
  
    let ativo = true;
    setReading(true);
  
    Promise.all([
      catalogosService.getEstados_canteiro(),
    ]).then(([estc, ]) => {
      if (!ativo) return;
      setEstados_canteiro(estc);
    })
    .catch((err) => {
      console.error("Erro ao carregar catálogos do canteiro:", err);
      showToast("Erro ao carregar catálogos.", "danger");
    })
    .finally(() => {
      if (ativo) setReading(false);
    });
  
    return () => { ativo = false };
  }, [show]);


  const salvar = () => {
    onSave({
      ...form,
    }, "canteiro");
  };
  
  if (!show) return null;
  return (
  <Modal show onHide={onClose} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>{data ? "Editar Canteiro" : "Novo Canteiro"}</Modal.Title>
    </Modal.Header>

      <Modal.Body>
        <Form onSubmit={salvar}>

          <Tabs
            activeKey={tab}
            onSelect={(k) => k && setTab(k)}
            className="mb-3"
          >
            <Tab eventKey="dados" title="Canteiro">
              <CanteiroDadosTab form={form} setForm={setForm} estadosCanteiro={estados_canteiro}/>
            </Tab>
            <Tab eventKey="posicao" title="Posição">
              <VetorTab value={form.posicao} onChange={posicao => setForm({ ...form, posicao })} />
            </Tab>
            <Tab eventKey="dimensao" title="Dimensão">
              <VetorTab value={form.dimensao} onChange={dimensao => setForm({ ...form, dimensao })} />
            </Tab>
            <Tab eventKey="aparencia" title="Aparência">
              <AparenciaTab value={form.aparencia} onChange={aparencia => setForm({ ...form, aparencia })} /> {/*TODO: INTEGRAR FORMULARIO DE VERTICES E DE APARENCIA*/}
            </Tab>
            <Tab eventKey="vertices" title="Vértices">
              <VerticesTab value={form.aparencia?.vertices} onChange={vertices => setForm(prev => ({...prev, aparencia: {...prev.aparencia,vertices}}))} />
            </Tab>
            {!restrito && 
            <Tab eventKey="restrito" title="Campos de Sistema">
              <CanteiroSistemaTab form={form} onChange={setForm} />
            </Tab>
            }
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