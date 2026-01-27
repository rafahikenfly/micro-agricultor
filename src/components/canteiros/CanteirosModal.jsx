import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import CanteiroDadosTab from "./CanteiroDadosTab";
import AparenciaTab from "../common/AparenciaTab";
import VerticesTab from "../common/VerticesTab";
import VetorTab from "../common/PosicaoTab";
import CanteiroSistemaTab from "./CanteiroSistemaTab";

export default function CanteirosModal({ show, onSave, onClose, data, restrito = false}) {
  const [tab, setTab] = useState("dados");
  const [form, setForm] = useState({
    nome: data.nome || "",
    descricao: data.descricao || "",
    estadoId: data.estadoId || "",
    estadoNome: data.estadoNome || "",
    aparencia: data.aparencia || {
      fundo: "#4CAF50",
      borda: "#1B5E20",
      espessura: 2,
      elipse: false,
      vertices: [],
    },
    // RESTRITO
    hortaId: data.hortaId || "",
    hortaNome: data.hortaNome || "",
    especieId: data.especieId || "",
    especieNome: data.especieNome || "",
  }
);

  useEffect(() => {
      if (data) setForm(data);
    }, [data]);
  
    const salvar = () => {
      onSave({
        ...form,
      });
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
              <CanteiroDadosTab form={form} setForm={setForm} estadosCanteiro={[]}/>
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