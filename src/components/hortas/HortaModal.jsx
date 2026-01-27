import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Tabs, Tab } from "react-bootstrap";
import AparenciaTab from "../common/AparenciaTab";
import VerticesTab from "../common/VerticesTab";

export default function HortaModal({ show, onClose, onSave, data, climas, }) {
  const [tab, setTab] = useState("dados");

  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    posicao: { lat: "", long: "" },
    altitude: "",
    climaId: "",
    climaNome: "",
    aparencia: {
      fundo: "#4CAF50",
      borda: "#1B5E20",
      espessura: 2,
      elipse: false,
      vertices: [],
    }
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const salvar = () => {
    const clima = climas.find(c => c.id === form.climaId);

    onSave({
      ...form,
      posicao: {
        lat: Number(form.posicao.lat),
        long: Number(form.posicao.long)
      },
      altitude: Number(form.altitude),
      climaNome: clima?.nome || ""
    });
  };

  if (!show) return null;

  return (
    <Modal show onHide={onClose} size="lg" backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>Horta</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Tabs
          activeKey={tab}
          onSelect={(k) => setTab(k)}
          className="mb-3"
        >
          {/* TAB DADOS */}
          <Tab eventKey="dados" title="Dados">
            <Form>
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
                <Form.Label>Clima</Form.Label>
                <Form.Select
                  value={form.climaId}
                  onChange={e =>
                    setForm({ ...form, climaId: e.target.value })
                  }
                >
                  <option value="">Selecione o clima</option>
                  {climas.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
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
