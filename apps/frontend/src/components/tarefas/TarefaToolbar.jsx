import { Form, Row, Col } from "react-bootstrap";
import { renderOptions } from "../../utils/formUtils";
import { ESTADO_TAREFA } from "micro-agricultor";

const TIME_RANGES = {
  DIA: { nome: "24h", value: 86400000 },
  SEMANA: { nome: "7 dias", value: 86400000 * 7 },
  MES: { nome: "30 dias", value: 86400000 * 30 },
  ALL: { nome: "Tudo", value: Date.now() },
};

export function TarefaToolbar({ onChange, options }) {
  function updateOptions(parcial) {
    const novasOpcoes = { ...options, ...parcial };
    onChange(novasOpcoes);
  }

  return (
    <Row className="align-items-center mb-3 g-2">

      {/* Tempo (baseado no vencimento) */}
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

      {/* Estado */}
      <Col xs="auto">
        <Form.Select
          size="sm"
          value={options.estado || ""}
          onChange={(e) =>
            updateOptions({ estado: e.target.value || null })
          }
        >
          {renderOptions({
            list: Object.values(ESTADO_TAREFA),
            nullOption: true,
            placeholder: "Qualquer estado",
            valueKey: "id",
            labelKey: "nome",
          })}
        </Form.Select>
      </Col>

      {/* Recorrência */}
      <Col xs="auto">
        <Form.Select
          size="sm"
          value={options.recorrente ?? ""}
          onChange={(e) =>
            updateOptions({
              recorrente:
                e.target.value === ""
                  ? null
                  : e.target.value === "true",
            })
          }
        >
          <option value="">Recorrente?</option>
          <option value="true">Sim</option>
          <option value="false">Não</option>
        </Form.Select>
      </Col>

      {/* Resolvida */}
      <Col xs="auto">
        <Form.Select
          size="sm"
          value={options.resolvida ?? ""}
          onChange={(e) =>
            updateOptions({
              resolvida:
                e.target.value === ""
                  ? null
                  : e.target.value === "true",
            })
          }
        >
          <option value="">Resolvida?</option>
          <option value="true">Sim</option>
          <option value="false">Não</option>
        </Form.Select>
      </Col>

      {/* Prioridade */}
      <Col xs="auto">
        <Form.Control
          size="sm"
          type="number"
          placeholder="Prioridade ≤"
          value={options.prioridade ?? ""}
          onChange={(e) =>
            updateOptions({
              prioridade: e.target.value
                ? Number(e.target.value)
                : null,
            })
          }
          style={{ width: 110 }}
        />
      </Col>

      {/* Busca */}
      <Col>
        <Form.Control
          size="sm"
          placeholder="Buscar tarefa"
          value={options.busca || ""}
          onChange={(e) =>
            updateOptions({ busca: e.target.value })
          }
        />
      </Col>

    </Row>
  );
}