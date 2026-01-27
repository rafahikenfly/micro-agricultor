import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import PlantaDadosTab from "./PlantaDadosTab";
import AparenciaTab from "../common/AparenciaTab";
import VerticesTab from "../common/VerticesTab";
import VetorTab from "../common/PosicaoTab";
import PlantaSistemaTab from "./PlantaSistemaTab";

import { catalogosService } from "../../services/catalogosService";


export default function PlantasModal({ show, onSave, onClose, data, restrito = false}) {
  const [tab, setTab] = useState("dados");
  const [especies, setEspecies] = useState([]);
  const [variedades, setVariedades] = useState([]);
  const [estadosPlantas, setEstadosPlantas] = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

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
    confianca: { 
      dimensao: data.confianca?.dimensao || { valor: 0, },
      posicao:  data.confianca?.posicao  || { valor: 0, },
    },
    dimensao: data.dimensao || {
      x: 0,
      y: 0,
      z: 0,
    },
    posicao: data.posicao || {
      x: 0,
      y: 0,
      z: 0,
    },
    especieId: data.especieId || "",
    especieNome: data.especieNome || "",
    variedadeId: data.variedadeId || "",
    variedadeNome: data.variedadeNome || "",

    // RESTRITO
    canteiroId: data.canteiroId || "",
    canteiroNome: data.canteiroNome || "",
    hortaId: data.hortaId || "",
    hortaNome: data.hortaNome || "",
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
  
  useEffect(() => {
    if (!show) return;
  
    let ativo = true;
    setLoadingCatalogos(true);
  
    Promise.all([
      catalogosService.getEspecies(),
      catalogosService.getVariedades(),
      catalogosService.getEstadosPlanta(),
    ]).then(([esps, vars, estados]) => {
      if (!ativo) return;
  
      setEspecies(esps);
      setVariedades(vars);
      setEstadosPlantas(estados);
      setLoadingCatalogos(false);
    });
  
    return () => { ativo = false };
  }, [show]);
    

  if (!show) return null;
  return (
  <Modal show onHide={onClose} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>{data ? "Editar Planta" : "Novo Planta"}</Modal.Title>
    </Modal.Header>

      <Modal.Body>
        <Form onSubmit={salvar}>

          <Tabs
            activeKey={tab}
            onSelect={(k) => k && setTab(k)}
            className="mb-3"
          >
            <Tab eventKey="dados" title="Planta">
              <PlantaDadosTab
                form={form}
                setForm={setForm}
                estadosPlantas={estadosPlantas}
                canteirosHorta={[]}
                especies={especies}
                variedades={variedades}
                loading={loadingCatalogos}
              />
            </Tab>
            <Tab eventKey="confianca" title="Confiança">
              TAB CONFIANCA
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
              <PlantaSistemaTab form={form} onChange={setForm} />
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