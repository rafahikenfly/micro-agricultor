import { Form, Row, Col, ButtonGroup, Button } from "react-bootstrap";
import { useState } from "react";

const TIME_RANGES = [
  { label: "24h", value: "1d" },
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
  { label: "Tudo", value: "all" },
];

export function MediaToolbar({
  onChange,
  defaultMode = "timeline",
}) {
  const [opcoes, setFilters] = useState({
    timeRange: "7d",
    tipo: "all",
    busca: "",
    mode: defaultMode,
  });

  function update(parcial) {
    const novasOpcoes = { ...opcoes, ...parcial };
    setFilters(novasOpcoes);
    onChange?.(novasOpcoes);
  }

  return (
    <Row className="align-items-center mb-3 g-2">
      {/* Tempo */}
      <Col xs="auto">
        <Form.Select
          size="sm"
          value={opcoes.timeRange}
          onChange={(e) => update({ timeRange: e.target.value })}
        >
          {TIME_RANGES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Form.Select>
      </Col>

      {/* Tipo */}
      <Col xs="auto">
        <Form.Select
          size="sm"
          value={opcoes.tipo}
          onChange={(e) => update({ tipo: e.target.value })}
        >
          <option value="all">Todos</option>
          <option value="captura">Capturas</option>
          <option value="anotada">Anotadas</option>
        </Form.Select>
      </Col>

      {/* Busca */}
      <Col>
        <Form.Control
          size="sm"
          placeholder="Buscar por nome ou descrição..."
          value={opcoes.busca}
          onChange={(e) => update({ busca: e.target.value })}
        />
      </Col>

      {/* Modo */}
      <Col xs="auto">
        <ButtonGroup size="sm">
          <Button
            variant={opcoes.mode === "grid" ? "primary" : "outline-secondary"}
            onClick={() => update({ mode: "grid" })}
          >
            Grid
          </Button>
          <Button
            variant={opcoes.mode === "timeline" ? "primary" : "outline-secondary"}
            onClick={() => update({ mode: "timeline" })}
          >
            Timeline
          </Button>
        </ButtonGroup>
      </Col>
    </Row>
  );
}