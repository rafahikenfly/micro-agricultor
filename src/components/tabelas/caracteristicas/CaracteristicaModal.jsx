import { useState, useEffect } from "react";
import { Modal, Form, Button, Card, InputGroup, Row, Col } from "react-bootstrap";
import { validarCaracteristica } from "@domain/estados.rules";
import { renderOptions } from "../../../utils/formUtils";
import { TIPOS_ENTIDADE } from "../../../utils/consts/TIPOS_ENTIDADE";
import { VARIANTS } from "../../../utils/consts/VARIANTS";

export default function CaracteristicaModal({ show, onSave, onClose, data = {}, }) {
  const [form, setForm] = useState(validarCaracteristica(data))

  useEffect(() => {
    if (!data) {
      setForm(validarCaracteristica({}));   // nova caracteristica limpo
    } else {
      setForm(validarCaracteristica(data)); // edição
    }
  }, [data]);
  
    const salvar = () => {
      onSave({
        ...form,
      });
    };
  
  if (!show) return null;
  return (
  <Modal show onHide={onClose} size="lg">
    <Modal.Header closeButton>
      <Modal.Title>{data ? "Editar Característica" : "Nova Característica"}</Modal.Title>
    </Modal.Header>

      <Modal.Body>
        <Form onSubmit={salvar}>

          {/* ===== Dados básicos ===== */}
          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <Card.Title className="mb-0 fs-6">Informações gerais</Card.Title>

              <Form.Group className="mb-3">
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  value={form.nome}
                  onChange={e => setForm({...form, nome: e.target.value})}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.descricao}
                  onChange={e => setForm({...form, descricao: e.target.value})}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Aplicável a:</Form.Label>
                <div className="d-flex flex-wrap gap-3 mt-2">
                  {TIPOS_ENTIDADE.map((tipo) => (
                    <Form.Check
                      key={tipo.id}
                      type="checkbox"
                      label={tipo.nome}
                      checked={!!form.aplicavel?.[tipo.id]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          aplicavel: {
                            ...form.aplicavel,
                            [tipo.id]: e.target.checked
                          }
                        })
                      }
                    />
                  ))}
                </div>
              </Form.Group>
            </Card.Body>
          </Card>

          {/* ===== Card: Confiança da informação ===== */}
<Card className="mb-3 shadow-sm">
  <Card.Body>

    {/* Header do card */}
    <div className="d-flex justify-content-between align-items-start mb-2">
      <div>
        <Card.Title className="mb-0 fs-6">
          Confiança da informação
        </Card.Title>
        <Card.Subtitle className="text-muted small">
          Modelo de obsolescência e validade da medida
        </Card.Subtitle>
      </div>

      <Form.Check
        type="switch"
        label="Aplicar obsolescência da informação"
        className="ms-3"
        checked={!!form.aplicarObsolescencia}
        onChange={(e) =>
          setForm({
            ...form,
            aplicarObsolescencia: e.target.checked
          })
        }
      />
    </div>

    <Form.Group>
      <Form.Label>Longevidade da medida</Form.Label>
      <InputGroup>
        <Form.Control
          type="number"
          value={form.longevidade}
          disabled={!form.aplicarObsolescencia}
          onChange={e => setForm({...form, longevidade: Number(e.target.value)})}
        />
        <InputGroup.Text>dias</InputGroup.Text>
      </InputGroup>

      <Form.Text className="text-muted">
        Tempo em que a confiança de uma informação se reduz de 100% para 20%.
      </Form.Text>
    </Form.Group>

  </Card.Body>
</Card>

          {/* ===== Card: Valor físico ===== */}
<Card className="mb-3 shadow-sm">
  <Card.Body>

    {/* Header do card */}
    <div className="d-flex justify-content-between align-items-start mb-2">
      <div>
        <Card.Title className="mb-0 fs-6">
          Valor físico
        </Card.Title>
        <Card.Subtitle className="text-muted small">
          Comportamento e variação da grandeza
        </Card.Subtitle>
      </div>

      <Form.Check
        type="switch"
        label="Aplicar variação com tempo"
        className="ms-3"
        checked={!!form.aplicarVariacao}
        onChange={(e) =>
          setForm({
            ...form,
            aplicarVariacao: e.target.checked
          })
        }
      />
    </div>

    <Row className="g-3 mt-1">
      <Col md={4}>
        <Form.Group>
          <Form.Label>Unidade</Form.Label>
          <Form.Control
            value={form.unidade}
            onChange={e => setForm({...form, unidade: e.target.value})}
          />
        </Form.Group>
      </Col>

      <Col md={4}>
        <Form.Group>
          <Form.Label>Valor mínimo</Form.Label>
          <Form.Control
            type="number"
            value={form.min}
            onChange={e => setForm({...form, min: Number(e.target.value)})}
          />
        </Form.Group>
      </Col>

      <Col md={4}>
        <Form.Group>
          <Form.Label>Valor máximo</Form.Label>
          <Form.Control
            type="number"
            value={form.max}
            onChange={e => setForm({...form, max: Number(e.target.value)})}
          />
        </Form.Group>
      </Col>

      <Col md={4}>
        <Form.Group>
          <Form.Label>Variação diária esperada</Form.Label>
          <InputGroup>
            <Form.Control
              type="number"
              value={form.variacaoDiaria}
              disabled={!form.aplicarVariacao}
              onChange={e => setForm({...form, variacaoDiaria: Number(e.target.value)})}
            />
            <InputGroup.Text>/ dia</InputGroup.Text>
          </InputGroup>
        </Form.Group>
      </Col>

      <Col md={4}>
        <Form.Group>
          <Form.Label>Resolução</Form.Label>
          <InputGroup>
            <Form.Control
              type="number"
              value={form.resolucao}
              onChange={e => setForm({...form, resolucao: Number(e.target.value)})}
            />
            <InputGroup.Text>cm</InputGroup.Text>
          </InputGroup>
        </Form.Group>
      </Col>
      <Col md={4}>
        <Form.Group>
          <Form.Label>Dimensões</Form.Label>
          <InputGroup>
            <Form.Control
              type="number"
              value={form.dimensoes}
              onChange={e => setForm({...form, dimensoes: Number(e.target.value)})}
            />
          </InputGroup>
        </Form.Group>
      </Col>
    </Row>

  </Card.Body>
</Card>

          {/* ===== Card: Visual ===== */}
          <Card className="mb-3">
            <Card.Body>
              <Card.Title className="mb-3">Identidade visual</Card.Title>

              <Form.Group>
                <Form.Label>Cor da Tag</Form.Label>
                <Form.Select
                  value={form.tagVariant}
                  onChange={e => setForm({...form, tagVariant: e.target.value})}
                  required
                >
                  {renderOptions({
                    list: VARIANTS,
                    placeholder: "Selecione a cor da tag",
                  })}
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>

        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="success" onClick={salvar}>Salvar</Button>
      </Modal.Footer>
    </Modal>
  )
}