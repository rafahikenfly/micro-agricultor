import { useState, useEffect } from "react";
import { Modal, Form, Button, Tabs, Tab } from "react-bootstrap";
import { validarPlanta } from "@domain/planta.rules";
import { VARIANT_TYPES } from "@shared/types/VARIANT_TYPES";

import { catalogosService } from "../../../services/catalogosService";
import { useToast } from "../../../services/toast/toastProvider";

import AparenciaTab from "../../../components/common/AparenciaTab";
import { EntidadeEstadoAtualTab } from "../../../components/common/EntidadeEstadoAtualTab";

import { handleSaveForm } from "../../../utils/formUtils";

import { PlantaLocalizacaoTab } from "./PlantaLocalizacaoTab";
import { PlantaEspecieTab } from "./PlantaEspecieTab";
import PlantaDadosTab from "./PlantaDadosTab";

export default function PlantaModal({ show, onSave, onClose, data}) {
  const { toastMessage } = useToast();  
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Catalogos
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [estados_planta, setEstados_planta] = useState([]);
  const [estagios_especie, setEstagios_especie] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [variedades, setVariedades] = useState([]);
  const [hortas, setHortas] = useState([]);
  const [canteiros, setCanteiros] = useState([]);
  const [reading, setReading] = useState(false);
  // Formulário
  const [form, setForm] = useState(validarPlanta(data));
  
  // ========== CARREGAR DADOS ==========
  // Sanitiza data
  useEffect(() => { setForm(validarPlanta(data ?? {})); }, [data]);
  // Carrega catálogos
  useEffect(() => {
    if (!show) return;
  
    let ativo = true;
    setReading(true);
  
    Promise.all([
      catalogosService.getCaracteristicas(),
      catalogosService.getEstados_planta(),
      catalogosService.getEstagios_especie(),
      catalogosService.getEspecies(),
      catalogosService.getVariedades(),
      catalogosService.getHortas(),
      catalogosService.getCanteiros(),
    ]).then(([carac, estp, este, espe, vari, hort, cant ]) => {
      if (!ativo) return;
      setCaracteristicas(carac);
      setEspecies(espe);
      setVariedades(vari);
      setEstados_planta(estp);
      setEstagios_especie(este);
      setHortas(hort);
      setCanteiros(cant);
    })
    .catch((err) => {
      console.error("Erro ao carregar catálogos da planta:", err);
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
    <Modal.Header closeButton>
      <Modal.Title>{data ? "Editar Planta" : "Nova Planta"}</Modal.Title>
    </Modal.Header>

      <Modal.Body>
        <Form onSubmit={(evt)=>handleSaveForm({
            evt,
            onSave,
            form,
            setForm,
            clearCache: "plantas",
          })}
        >
          <Tabs
            activeKey={tab}
            onSelect={(k) => k && setTab(k)}
            className="mb-3"
          >
            <Tab eventKey="dados" title="Planta">
              <PlantaDadosTab
                form={form}
                setForm={setForm}
                estadosPlanta={estados_planta}
                estagios_especie={estagios_especie}
                especies={especies}
                canteiros={canteiros}
                variedades={variedades}
                loading={reading}
              />
            </Tab>
            <Tab eventKey="localizacao" title="Localização">
              <PlantaLocalizacaoTab
                form={form}
                setForm={setForm}
                hortas={hortas}
                canteiros={canteiros}
                loading={reading}
              />
            </Tab>
            <Tab eventKey="especie" title="Espécie">
              <PlantaEspecieTab
                form={form}
                setForm={setForm}
                variedades={variedades}
                especies={especies}
//                estagiosEspecie={estagios_especie}
                loading={reading}
              />
            </Tab>
            <Tab eventKey="aparencia" title="Aparência">
              <AparenciaTab
                formAparencia={form.aparencia}
                setFormAparencia={aparencia => setForm({ ...form, aparencia })} />
            </Tab>
            <Tab eventKey="estadoAtual" title="Estado">
              <EntidadeEstadoAtualTab
                formEstadoAtual={form.estadoAtual ?? {}}
                caracteristicas={caracteristicas}
                tipoEntidadeId="planta"
                setFormEstadoAtual={(estadoAtual) => setForm({ ...form, estadoAtual })}
              />
            </Tab>
          </Tabs>
        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="success" type="submit">Salvar</Button>
      </Modal.Footer>
    </Modal>
  )
}