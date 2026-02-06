import { useState, useEffect } from "react";
import { Modal, Button, Form, Tabs, Tab } from "react-bootstrap";
// import { catalogosService } from "../../services/catalogosService";
import { validarHorta } from "../../domain/horta.rules";
import AparenciaTab from "../common/AparenciaTab";
import VerticesTab from "../common/VerticesTab";


export default function HortaModal({ show, onClose, onSave, data, setToast}) {
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Catalogos
  const [reading, setReading] = useState(false);
  // Formulário
  const [form, setForm] = useState(validarHorta(data));

  useEffect(() => {
    if (!data) {
      setForm(validarHorta({}));   // nova horta limpa
    } else {
      setForm(validarHorta(data)); // edição
    }
  }, [data]);

  useEffect(() => {
    if (!show) return;
  
    let ativo = true;
    setReading(true);
  
    Promise.all([
//      catalogosService.getEstados_planta(),
    ]).then(([plns, ]) => {
      if (!ativo) return;
  
//      setEstados_planta(plns);
    })
    .catch((err) => {
      console.error("Erro ao carregar catálogos da horta:", err);
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
      posicao: {
        lat: Number(form.posicao.lat),
        long: Number(form.posicao.long)
      },
      altitude: Number(form.altitude),
    }, "horta");
  };

  if (!show) return null;

  return (
    <Modal show onHide={onClose} size="lg" backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>Horta</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Tabs
            activeKey={tab}
            onSelect={(k) => setTab(k)}
            className="mb-3"
          >
            {/* TAB DADOS */}
            <Tab eventKey="dados" title="Dados">
              <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  type="text"
                  value={form.nome}
                  onChange={e =>
                    setForm({ ...form, nome: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.descricao}
                  onChange={e =>
                    setForm({ ...form, descricao: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Latitude (milésimos de grau)</Form.Label>
                <Form.Control
                  type="number"
                  value={form.posicao.lat}
                  onChange={e =>
                    setForm({
                      ...form,
                      posicao: {
                        ...form.posicao,
                        lat: e.target.value
                      }
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Longitude (milésimos de grau)</Form.Label>
                <Form.Control
                  type="number"
                  value={form.posicao.long}
                  onChange={e =>
                    setForm({
                      ...form,
                      posicao: {
                        ...form.posicao,
                        long: e.target.value
                      }
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Altitude (m)</Form.Label>
                <Form.Control
                  type="number"
                  value={form.altitude}
                  onChange={e =>
                    setForm({ ...form, altitude: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Orientação (graus)</Form.Label>
                <Form.Control
                  type="number"
                  value={form.orientacao}
                  onChange={e =>
                    setForm({ ...form, orientacao: Number(e.target.value) })
                  }
                />
              </Form.Group>
            </Tab>

            {/* TAB APARÊNCIA */}
            <Tab eventKey="aparencia" title="Aparência">
              <AparenciaTab
                value={form.aparencia}
                onChange={aparencia =>
                  setForm({ ...form, aparencia })
                }
              />
            </Tab>
            {/* TAB VERTICES */}
            <Tab eventKey="vertices" title="Vértices">
              <VerticesTab
                value={form.aparencia.vertices}
                onChange={vertices =>
                  setForm(prev => ({
                    ...prev,
                    aparencia: {
                      ...prev.aparencia,
                      vertices
                    }
                  }))
                }
              />
            </Tab>
          </Tabs>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={salvar}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
