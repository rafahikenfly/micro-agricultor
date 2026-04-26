import { Row, Col, Button, Form } from "react-bootstrap";
import { renderOptions } from "../../utils/formUtils";

export default function ListaToolbar({
  onNovo,
  filtros,
  setFiltros,
  configFiltros = []
}) {
  const handleChange = (key, value) => {
    setFiltros(//(f) => (
      {
      ...filtros,
      [key]: value || null
    })
  //);
  };

  return (
    <Row className="mb-3 align-items-center">
      {/* Botão */ onNovo &&
      <Col xs="auto">
        <Button variant="outline-success" onClick={onNovo}>
          + Novo
        </Button>
      </Col>}

      {/* Filtros */}
      {configFiltros.map((filtro) => (
        <Col key={filtro.key} md={3}>
          {filtro.type === "select" && (
            <Form.Select
              value={filtros[filtro.key] ?? ""}
              onChange={(e) => handleChange(filtro.key, e.target.value)}
            >
                {renderOptions({
                    ...filtro,
                    nullOption: true,
                })}

            </Form.Select>
          )}

          {filtro.type === "text" && (
            <Form.Control
              placeholder={filtro.placeholder}
              value={filtros[filtro.key] ?? ""}
              onChange={(e) => handleChange(filtro.key, e.target.value)}
            />
          )}
        </Col>
      ))}
    </Row>
  );
}