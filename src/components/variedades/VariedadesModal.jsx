import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import VerticesTab from "../common/VerticesTab";
import AparenciaTab from "../common/AparenciaTab";
import VariedadeDadosTab from "./VariedadesDadosTab";
import VariedadesEstagioTab from "./VariedadesEstagioTab";

export default function VariedadesModal({ show, onSave, onClose, data = {}, especies, parametros, caracteristicasPlanta}) {
    const [tab, setTab] = useState("dados");
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
  
    const salvar = () => {
      onSave({
        ...form,
      });
    };
  
  if (!show) return null;

  const cicloEspecie = especies.find(e => e.id === form.especieId)?.ciclo ?? [];

  const atualizaCiclo = (data, index) => {
      setForm(prev => {
        const novoCiclo = [...prev.ciclo];
        novoCiclo[index] = data;
        novoCiclo[index].estagioId ??= cicloEspecie[index].estagioId
        novoCiclo[index].estagioNome ??= cicloEspecie[index].estagioNome

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
                <Tab eventKey={"fase"-idx} title={f.estagioNome}>
                    <VariedadesEstagioTab value={form.ciclo[idx]} index={idx} onChange={atualizaCiclo} parametros={parametros} caracteristicas={caracteristicasPlanta}/>
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