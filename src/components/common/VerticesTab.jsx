import { Button, Form, Row, Col, Table } from "react-bootstrap";

export default function VerticesTab({ value = [], onChange }) {

  const atualizar = (idx, campo, val) => {
    const novo = [...value];
    novo[idx] = {
      ...novo[idx],
      [campo]: Number(val)
    };
    onChange(novo);
  };

  const adicionar = () => {
    onChange([...value, { x: 0, y: 0 }]);
  };

  const remover = (idx) => {
    const novo = value.filter((_, i) => i !== idx);
    onChange(novo);
  };

  /* ====== SVG ====== */
  const padding = 10;

  const xs = value.map(v => v.x);
  const ys = value.map(v => v.y);

  const minX = Math.min(...xs, 0);
  const maxX = Math.max(...xs, 100);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 100);

  const width = maxX - minX || 100;
  const height = maxY - minY || 100;

  const points = value
    .map(v => `${v.x - minX + padding},${v.y - minY + padding}`)
    .join(" ");

  return (
    <Row>
      {/* ===== LISTA DE PONTOS ===== */}
      <Col md={6}>
        <Table size="sm" bordered>
          <thead>
            <tr>
              <th>#</th>
              <th>X</th>
              <th>Y</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {value.map((v, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>
                  <Form.Control
                    type="number"
                    size="sm"
                    value={v.x}
                    onChange={e =>
                      atualizar(idx, "x", e.target.value)
                    }
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    size="sm"
                    value={v.y}
                    onChange={e =>
                      atualizar(idx, "y", e.target.value)
                    }
                  />
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => remover(idx)}
                  >
                    ✕
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Button size="sm" onClick={adicionar}>
          + Adicionar ponto
        </Button>
      </Col>

      {/* ===== PREVIEW SVG ===== */}
      <Col md={6}>
        <svg
          width="100%"
          height="240"
          viewBox={`0 0 ${width + padding * 2} ${height + padding * 2}`}
          style={{ border: "1px solid #ccc", background: "#f8f9fa" }}
        >
          {/* linhas auxiliares */}
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="none"
            stroke="#ddd"
          />

          {/* polígono */}
          {value.length >= 2 && (
            <polygon
              points={points}
              fill="rgba(13,110,253,0.15)"
              stroke="#0d6efd"
              strokeWidth="2"
            />
          )}

          {/* vértices */}
          {value.map((v, idx) => (
            <circle
              key={idx}
              cx={v.x - minX + padding}
              cy={v.y - minY + padding}
              r="4"
              fill="#dc3545"
            />
          ))}
        </svg>
      </Col>
    </Row>
  );
}
