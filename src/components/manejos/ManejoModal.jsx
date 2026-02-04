import { Modal, Tabs, Tab, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import ManejoDadosTab from "./ManejoDadosTab";
import ManejoEfeitosTab from "./ManejoEfeitosTab";
import EntradasTab from "../common/EntradasTab";
import { catalogosService } from "../../services/catalogosService";

export default function ManejoModal({ show, onSave, onClose, data = {}, showToast}) {
  const [tab, setTab] = useState("dados");
  const [estados_planta, setEstados_planta] = useState([]);
  const [estados_canteiro, setEstados_canteiro] = useState([]);
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [reading, setReading] = useState(false);

  const [form, setForm] = useState({
    descricao: data?.descricao || "",
    efeitos: data?.efeitos || {},
    entradas: data?.entradas || [],
    estadoDestinoId: data?.estadoDestinoId || "",
    estadoDestinoNome: data?.estadoDestinoNome || "",
    estadoOrigemId: data?.estadoOrigemId || "",
    estadoOrigemNome: data?.estadoOrigemNome || "",
    nome: data?.nome || "",
    requerEntrada: data?.requerEntrada || false,
    tipoEntidade: data?.tipoEntidade || "Canteiro",
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

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
      setCaracteristicas(carac);
    })
    .catch((err) => {
      console.error("Erro ao carregar catálogos do manejo:", err);
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
  return (
    <Modal show onHide={onClose} size="lg">
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

          <Tab eventKey="efeitos" title="Efeitos">
            <ManejoEfeitosTab 
              efeitos={form.efeitos || []}
              onChange={efeitos => setForm({ ...form, efeitos }) }
              caracteristicas={caracteristicas.filter(c => c.aplicavel?.[form.tipoEntidade] === true)}
              loading={reading}
            />
          </Tab>

          <Tab
            eventKey="entradas"
            title="Entradas"
            disabled={true || !form.requerEntrada}
          >
            <EntradasTab
              value={form.entradas}
              onChange={entradas =>
                setForm({ ...form, entradas })
              }
           />
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="success" onClick={salvar}>Salvar</Button>
      </Modal.Footer>
    </Modal>
  );
}
