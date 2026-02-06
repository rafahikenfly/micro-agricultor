import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { catalogosService } from "../../services/catalogosService";
import PlantaDadosTab from "./PlantaDadosTab";
import AparenciaTab from "../common/AparenciaTab";
import VerticesTab from "../common/VerticesTab";
import VetorTab from "../common/VetorTab";
import PlantaSistemaTab from "./PlantaSistemaTab";
import { validarPlanta } from "../../domain/planta.rules";

export default function PlantaModal({ show, onSave, onClose, data, restrito = false, setToast}) {
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Catalogos
  const [estados_planta, setEstados_planta] = useState([]);
  const [estagios_especie, setEstagios_especie] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [variedades, setVariedades] = useState([]);
  const [canteiros, setCanteiros] = useState([]);
  const [reading, setReading] = useState(false);
  // Formulário
  const [form, setForm] = useState(validarPlanta(data));

  useEffect(() => {
    if (!data) {
      setForm(validarPlanta({}));   // nova planta limpa
    } else {
      setForm(validarPlanta(data)); // edição
    }
    }, [data]);

    // ========== CARREGAR DADOS ==========
  useEffect(() => {
    if (!show) return;
  
    let ativo = true;
    setReading(true);
  
    Promise.all([
      catalogosService.getEstados_planta(),
      catalogosService.getEstagios_especie(),
      catalogosService.getEspecies(),
      catalogosService.getVariedades(),
      catalogosService.getCanteiros(),
    ]).then(([estp, este, espe, vari, cant]) => {
      if (!ativo) return;
      setEspecies(espe);
      setVariedades(vari);
      setCanteiros(cant);
      setEstados_planta(estp);
      setEstagios_especie(este);
      console.log("Catalogos planta carregados no modal.",estp,este);
    })
    .catch((err) => {
      console.error("Erro ao carregar catálogos da planta:", err);
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
    }, "planta");
  };
  
  if (!show) return null;
  return (
  <Modal show onHide={onClose} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>{data ? "Editar Planta" : "Nova Planta"}</Modal.Title>
    </Modal.Header>

      <Modal.Body>
        <Form onSubmit={salvar}>

          <Tabs
            activeKey={tab}
            onSelect={(k) => k && setTab(k)}
            className="mb-3"
          >
            <Tab eventKey="dados" title="Canteiro">
              <PlantaDadosTab
                form={form}
                setForm={setForm}
                estados_planta={estados_planta}
                estagios_especie={estagios_especie}
                especies={especies}
                canteiros={canteiros}
                variedades={variedades}
                loading={reading}
              />
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