import { Row, Col, Form } from "react-bootstrap";

export default function UsuarioDadosTab({ form, onChange }) {
  const handleChange = (field) => (e) => {
    onChange(field, e.target.value);
  };

  return (
    <>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group controlId="perfilNome">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              value={form.nome}
              onChange={handleChange("nome")}
              required
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group controlId="perfilApelido">
            <Form.Label>Apelido</Form.Label>
            <Form.Control
              value={form.apelido}
              onChange={handleChange("apelido")}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Group controlId="perfilDescricao">
            <Form.Label>Sobre você</Form.Label>
            <Form.Control
              value={form.descricao}
              onChange={handleChange("descricao")}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group controlId="perfilEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={form.email}
              onChange={handleChange("email")}
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );
}