import { Form, Row, Col, ButtonGroup, Button } from "react-bootstrap";
import { useState } from "react";

const TIME_RANGES = {
  DIA: { nome: "24h", value: 86400000 },
  SEMANA: { nome: "7 dias", value: 86400000 * 7 },
  MES: { nome: "30 dias", value: 86400000 * 30 },
  ALL: { nome: "Tudo", value: Date.now() },
};

const TIPOS = {
  ANOTADA: { anotada: true, },
  CAPTURA: { anotada: false, },
}

export function MediaToolbar({
  onChange,
  options,
}) {

  function updateOptions(parcial) {
    const novasOpcoes = { ...options, ...parcial };
    onChange(novasOpcoes);
  }

  
  return (
    <Row className="align-items-center mb-3 g-2">
      {/* Tempo */}
      <Col xs="auto">
        <Form.Select
          size="sm"
          value={options.timeRange}
          onChange={(e) => onChange({ timeRange: e.target.value, timeRangeValue: TIME_RANGES[e.target.value].value })}
        >
          {Object.entries(TIME_RANGES).map(([k,v]) => (
            <option key={k} value={k}>{v.nome}</option>
          ))}
        </Form.Select>
      </Col>

      {/* Tipo */}
      <Col xs="auto">
        <Form.Select
          size="sm"
          value={options.tipo}
          onChange={(e) => onChange({ tipo: e.target.value, ...TIPOS[e.target.value] })}
        >
          <option value="CAPTURA">Capturas</option>
          <option value="ANOTADA">Resultados</option>
        </Form.Select>
      </Col>

      {/* Busca */}
      <Col>
        <Form.Control
          size="sm"
          placeholder="Buscar por descrição"
          value={options.busca}
          onChange={(e) => updateOptions({ busca: e.target.value })}
        />
      </Col>

      {/* Modo */}
      <Col xs="auto">
        <ButtonGroup size="sm">
          <Button
            variant={options.mode === "grid" ? "success" : "outline-success"}
            onClick={() => updateOptions({ mode: "grid" })}
          >
            Grid
          </Button>
          <Button
            variant={options.mode === "timeline" ? "success" : "outline-success"}
            onClick={() => updateOptions({ mode: "timeline" })}
          >
            Timeline
          </Button>
        </ButtonGroup>
      </Col>
    </Row>
  );
}