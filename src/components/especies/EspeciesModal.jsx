import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import EspecieDadosTab from "./EspeciesDadosTab";
import EspecieEstagiosTab from "./EspecieEstagiosTab";
import VerticesTab from "../common/VerticesTab";
import AparenciaTab from "../common/AparenciaTab";
import { catalogosService } from "../../services/catalogosService";

export default function EspeciesModal({ show, onSave, onClose, data = {}, estagiosEspecie}) {
    const [tab, setTab] = useState("dados");
    const [categorias_especie, setCategorias_especie] = useState([]);
    const [loadingCatalogos, setLoadingCatalogos] = useState(false);

    const [form, setForm] = useState({
      categoriaId: data?.categoriaId || "",
      categoriaNome: data?.categoriaNome || "",
      ciclo: data?.ciclo || [],
      descricao: data?.descricao || "",
      nome: data?.nome || "",
      nomeCientifico: data?.nomeCientifico || "",
      aparencia: data?.aparencia || {
        fundo: "#4CAF50",
        borda: "#1B5E20",
        espessura: 2,
        elipse: false,
        vertices: [],
      }
    }
  );

  useEffect(() => {
      if (data) setForm(...form, data);
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
      catalogosService.getCategorias_especie(),
    ]).then(([cats,]) => {
      if (!ativo) return;
  
      setCategorias_especie(cats);
      setLoadingCatalogos(false);
    });
  
    return () => { ativo = false };
  }, [show]);
  
  if (!show) return null;
  return (
    <Modal show onHide={onClose} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>{data ? "Editar Especie" : "Nova Especie"}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
      <Form onSubmit={salvar}>

        <Tabs 
          activeKey={tab}
          onSelect={(k) => setTab(k)}
          className="mb-3"
        >
            <Tab eventKey="dados" title="Espécie">
                <EspecieDadosTab
                  form={form}
                  setForm={setForm}
                  categorias_especie={categorias_especie}
                  loading={loadingCatalogos}
                />
            </Tab>
            <Tab eventKey="ciclo" title="Ciclo">
                <EspecieEstagiosTab value={form.ciclo} onChange={ciclo => setForm({ ...form, ciclo })} estagios={estagiosEspecie} />
            </Tab>
            <Tab eventKey="aparencia" title="Aparência Padrão">
                <AparenciaTab value={form.aparencia} onChange={aparencia => setForm({ ...form, aparencia })} /> {/*TODO: INTEGRAR FORMULARIO DE VERTICES E DE APARENCIA*/}
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