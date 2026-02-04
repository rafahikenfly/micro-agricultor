import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import VerticesTab from "../common/VerticesTab";
import AparenciaTab from "../common/AparenciaTab";
import VariedadeDadosTab from "./VariedadesDadosTab";
import VariedadesEstagioTab from "./VariedadesEstagioTab";
import { catalogosService } from "../../services/catalogosService";

export default function VariedadesModal({ show, onSave, onClose, data = {}, }) {
    const [tab, setTab] = useState("dados");
    const [especies, setEspecies] = useState([]);
    const [caracteristicas, setCaracteristicas] = useState([]);
    const [reading, setReading] = useState(false);
    const [form, setForm] = useState({
      especieId: "",
      especieNome: "",
      nome: "",
      descricao: "",
      espacamento: {x: 0, y:0, z:0},
      condicaoBasica: {},
      aparencia: {
        fundo: "#4CAF50",
        borda: "#1B5E20",
        espessura: 2,
        elipse: false,
        vertices: [],
      },
      ciclo: [],
    }
  );

  useEffect(() => {
      if (data) setForm(data);
    }, [data]);

  // ========== CARREGAR DADOS ==========
  useEffect(() => {
    if (!show) return;
  
    let ativo = true;
    setReading(true);
  
    Promise.all([
      catalogosService.getCaracteristicas(),
      catalogosService.getEspecies(),
    ]).then(([carac, esps]) => {
      if (!ativo) return;
      setEspecies(esps);
      setCaracteristicas(carac);
    })
    .catch((err) => {
      console.error("Erro ao carregar catálogos da variedade:", err);
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
    });
  };
  
  if (!show) return null;

  const cicloEspecie = especies.find(e => e.id === form.especieId)?.ciclo ?? [];

  const atualizaCiclo = (data, idx) => {
      setForm(prev => {
        const novoCiclo = [...prev.ciclo];
        novoCiclo[idx] = data;
        novoCiclo[idx].estagioId ??= cicloEspecie[idx].estagioId
        novoCiclo[idx].estagioNome ??= cicloEspecie[idx].estagioNome
        console.log("no",novoCiclo)
        return {
          ...prev,
          ciclo: novoCiclo
        };
      })
    }

  return (
    <Modal show onHide={onClose} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>{data ? "Editar Variedade" : "Nova Variedade"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
      <Form onSubmit={salvar}>

        <Tabs 
          activeKey={tab}
          onSelect={(k) => setTab(k)}
          className="mb-3"
        >
            <Tab eventKey="dados" title="Espécie">
                <VariedadeDadosTab form={form} setForm={setForm} especies={especies}/>
            </Tab>
            <Tab eventKey="aparencia" title="Aparência">
                <AparenciaTab value={form.aparencia} onChange={aparencia => setForm({ ...form, aparencia })} /> {/*TODO: INTEGRAR FORMULARIO DE VERTICES E DE APARENCIA*/}
            </Tab>
            <Tab eventKey="vertices" title="Vértices">
                <VerticesTab value={form.aparencia?.vertices} onChange={vertices => setForm(prev => ({...prev, aparencia: {...prev.aparencia,vertices}}))} />
            </Tab>
            {cicloEspecie.map((f,idx)=>(
                <Tab eventKey={`fase-${idx}`} title={f.estagioNome}>
                    <VariedadesEstagioTab
                      value={form.ciclo[idx]}
                      index={idx}
                      onChange={atualizaCiclo}
                      caracteristicas={caracteristicas}
                    />
                </Tab>
            ))}
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