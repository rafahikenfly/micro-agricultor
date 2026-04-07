import { Form, Row, Col } from "react-bootstrap";
import { renderOptions } from "../../utils/formUtils";
import { EVENTO, ORIGEM } from "micro-agricultor";

const TIME_RANGES = {
  DIA: { nome: "24h", value: 86400000 },
  SEMANA: { nome: "7 dias", value: 86400000 * 7 },
  MES: { nome: "30 dias", value: 86400000 * 30 },
  ALL: { nome: "Tudo", value: Date.now() },
};

export function EventoToolbar({
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
          onChange={(e) =>
            onChange({
              timeRange: e.target.value,
              timeRangeValue: TIME_RANGES[e.target.value].value,
            })
          }
        >
          {Object.entries(TIME_RANGES).map(([k, v]) => (
            <option key={k} value={k}>
              {v.nome}
            </option>
          ))}
        </Form.Select>
      </Col>

      {/* Tipo de Evento */}
      <Col xs="auto">
        <Form.Select
          size="sm"
          value={options.tipoEvento || ""}
          onChange={(e) =>
            updateOptions({ tipoEventoId: e.target.value })
          }
        >
          {renderOptions({
            list: Object.values(EVENTO),
            nullOption: true,
            placeholder: "Qualquer evento",
            valueKey: "id",
            labelKey: "nome",
          })}
        </Form.Select>
      </Col>

      {/* Origem */}
      <Col xs="auto">
        <Form.Select
          size="sm"
          value={options.origemTipo || ""}
          onChange={(e) =>
            updateOptions({ origemTipo: e.target.value })
          }
        >
          {renderOptions({
            list: Object.values(ORIGEM),
            nullOption: true,
            placeholder: "Qualquer origem",
            valueKey: "id",
            labelKey: "nome",
          })}
        </Form.Select>
      </Col>

      {/* Busca */}
      <Col>
        <Form.Control
          size="sm"
          placeholder="Buscar evento"
          value={options.busca || ""}
          onChange={(e) =>
            updateOptions({ busca: e.target.value })
          }
        />
      </Col>

    </Row>
  );
}