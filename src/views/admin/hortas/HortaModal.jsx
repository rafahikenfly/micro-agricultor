import { useState, useEffect } from "react";
import { Modal, Button, Form, Tabs, Tab } from "react-bootstrap";
import { validarHorta } from "@domain/horta.rules";
import { VARIANT_TYPES } from "@shared/types/VARIANT_TYPES";

import { catalogosService } from "../../../services/catalogosService";
import { useToast } from "../../../services/toast/toastProvider";

import { handleSaveForm } from "../../../utils/formUtils";

import AparenciaTab from "../../../components/common/AparenciaTab";

import HortaDadosTab from "./HortaDadosTab";
import HortaPosicaoTab from "./HortaPosicaoTab";
import HortaMembrosTab from "./HortaMembros";


export default function HortaModal({ show, onClose, onSave, data}) {
  const { toastMessage } = useToast();
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Catalogos
  const [usuarios, setUsuarios] = useState([]);
  const [reading, setReading] = useState(false);
  // Formulário
  const [form, setForm] = useState(validarHorta(data));

  useEffect(() => {
    if (!data) { setForm(validarHorta({})); }  // nova horta limpa
    else { setForm(validarHorta(data)); }      // edição
  }, [data]);

  useEffect(() => {
    if (!show) return;
  
    let ativo = true;
    setReading(true);
  
    Promise.all([
      catalogosService.getUsuarios(),
    ]).then(([users, ]) => {
      if (!ativo) return;
  
      setUsuarios(users);
    })
    .catch((err) => {
      console.error("Erro ao carregar catálogos da horta:", err);
      toastMessage({
        body: "Erro ao carregar catálogos.",
        variant: VARIANT_TYPES.YELLOW
      });
    })
    .finally(() => {
      if (ativo) setReading(false);
    });
  
    return () => { ativo = false };
  }, [show]);


  if (!show) return null;
  return (
    <Modal show onHide={onClose} size="lg" backdrop="static" centered>
      <Form onSubmit={(evt)=>handleSaveForm({
          evt,
          onSave,
          form,
          setForm,
          clearCache: "hortas",
        })}
      >
        <Modal.Header closeButton>
          <Modal.Title>Horta</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Tabs
            activeKey={tab}
            onSelect={(k) => setTab(k)}
            className="mb-3"
          >
            <Tab eventKey="dados" title="Dados">
              <HortaDadosTab
                form={form}
                setForm={setForm}
              />
              </Tab>
              <Tab eventKey="posicao" title="Posição">
                <HortaPosicaoTab
                  formPosicao={form.posicao}
                  setFormPosicao={(posicao) => setForm({ ...form, posicao}) }
                />
              </Tab>
            <Tab eventKey="aparencia" title="Aparência">
              <AparenciaTab
                formAparencia={form.aparencia}
                setFormAparencia={(aparencia) => setForm({ ...form, aparencia }) }
              />
            </Tab>
            <Tab eventKey="membros" title="Membros">
              <HortaMembrosTab
                formMembros={form.membros}
                setFormMembros={(membros) => setForm({ ...form, membros }) }
                usuarios={usuarios}
                loading={reading}
              />
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="success" type="submit">Salvar</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
