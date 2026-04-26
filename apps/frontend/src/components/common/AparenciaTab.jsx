import { Form, Row, Col } from "react-bootstrap";
import { GEOMETRIA } from "micro-agricultor";

import { renderOptions, StandardArrayInput, StandardCard, StandardInput } from "../../utils/formUtils";

export default function AparenciaTab({ formAparencia, setFormAparencia }) {
  const vertices = formAparencia?.vertices ?? []
  const setVertices = (novoArr) => setFormAparencia({ ...formAparencia, vertices: novoArr });
  const onChangeVertice = (idx, campo, val) => {
    const novoArr = [...vertices];
    novoArr[idx] = { ...novoArr[idx], [campo]: Number(val) };
    setVertices(novoArr);
  };

  /* ====== SVG ====== */
  const padding = 10;

  const xs = vertices.map(v => v.x);
  const ys = vertices.map(v => v.y);

  const minX = Math.min(...xs, 0);
  const maxX = Math.max(...xs, 100);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 100);

  const width = maxX - minX || 100;
  const height = maxY - minY || 100;

  const fill = formAparencia.fundo || "transparent";
  const stroke = formAparencia.borda || "#000";
  const strokeWidth = formAparencia.espessura || 2;

  const points = vertices
    .map(v => `${v.x - minX + padding},${v.y - minY + padding}`)
    .join(" ");

  const renderShapePreview = () => {
    switch (formAparencia.geometria) {
      case "circle":
        return (
          <circle
            cx={width / 2 + padding}
            cy={height / 2 + padding}
            r={Math.min(width, height) / 2}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );

      case "ellipse":
        return (
          <ellipse
            cx={width / 2 + padding}
            cy={height / 2 + padding}
            rx={width / 2}
            ry={height / 2}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );

      case "rect":
        return (
          <rect
            x={padding}
            y={padding}
            width={width}
            height={height}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );

      case "polygon":
      default:
        return (
          vertices.length >= 2 && (
            <polygon
              points={points}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
          )
        );
    }
  };

  /* ====== RENDER ====== */
  return (
    <>
      <StandardCard header="Aparência">
        <Row>
          <Col>
            <StandardInput label="Cor de fundo">
              <Form.Control
                type="color"
                value={formAparencia.fundo}
                onChange={e => setFormAparencia({...formAparencia, fundo: e.target.value})}
              />
            </StandardInput>
            <StandardInput label="Cor da borda">
              <Form.Control
                type="color"
                value={formAparencia.borda}
                onChange={e => setFormAparencia({...formAparencia, borda: e.target.value})}
              />
            </StandardInput>
            <StandardInput label="Espessura da borda">
              <Form.Control
                type="number"
                min={1}
                value={formAparencia.espessura}
                onChange={e => setFormAparencia({...formAparencia, espessura: Number(e.target.value)})}
              />
            </StandardInput>
          </Col>
          <Col>
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
              {renderShapePreview()}
            </svg>
          </Col>
        </Row>
      </StandardCard>
      <StandardCard header="Geometria">
        <Row>
          <Col>
            <StandardInput label="Geometria" stacked>
              <Form.Select
                value={formAparencia.geometria || ""}
                onChange={e => setFormAparencia({...formAparencia, geometria: e.target.value})}
              >
                {renderOptions({
                  list: Object.values(GEOMETRIA),
                  placeholder: "Selecione a geometria",
                })}
              </Form.Select>
            </StandardInput>
          </Col>
          {formAparencia.geometria === "polygon" && <Col md={6}>
            <StandardArrayInput
              form={vertices}
              setForm={setVertices}
              inputLabel="Novo ponto"
              inputButtonLabel="Adicionar novo ponto"
              inputData={{ x: 0, y: 0 }}
              colunas = {[
                {rotulo: "x", render: (item, idx) => <Form.Control
                  type="number"
                  size="sm"
                  value={item.x}
                  onChange={e => onChangeVertice(idx, "x", e.target.value)}
                />},
                {rotulo: "y", render: (item, idx) => <Form.Control
                  type="number"
                  size="sm"
                  value={item.y}
                  onChange={e => onChangeVertice(idx, "y", e.target.value)}
                />},
              ]}
            />
          </Col>}
        </Row>
      </StandardCard>
    </>
  );
}
