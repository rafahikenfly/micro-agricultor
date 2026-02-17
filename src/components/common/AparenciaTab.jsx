import React from "react";
import { Form, Row, Col, Table, Button, Card } from "react-bootstrap";
import { renderOptions, StandardCard, StandardInput } from "../../utils/formUtils";
import { GEOMETRIAS } from "../../utils/consts/GEOMETRIAS";
import ListaArray from "./ListaArray";

export default function AparenciaTab({ formAparencia, setFormAparencia }) {
  const formArray = formAparencia?.vertices ?? []
  const arrayField = "vertices"
  const onChangeField = (field, v) => { setFormAparencia({ ...formAparencia, [field]: v }); };
  const onChangeArr = (novoArr) => onChangeField(arrayField,novoArr)
  const onChangeArrElementProp = (idx, campo, val) => {
    const novoArr = [...formArray];
    novoArr[idx] = { ...novoArr[idx], [campo]: Number(val) };
    onChangeArr(novoArr);
  };
  const onAddArrElement = () => { onChangeArr([...formArray, { x: 0, y: 0 }]); };
  const onRemoveArrElement = (idx) => {
    const novoArr = formArray.filter((_, i) => i !== idx);
    onChangeArr(novoArr);
  };


  /* ====== SVG ====== */
  const padding = 10;

  const xs = formArray.map(v => v.x);
  const ys = formArray.map(v => v.y);

  const minX = Math.min(...xs, 0);
  const maxX = Math.max(...xs, 100);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 100);

  const width = maxX - minX || 100;
  const height = maxY - minY || 100;

  const fill = formAparencia.fundo || "transparent";
  const stroke = formAparencia.borda || "#000";
  const strokeWidth = formAparencia.espessura || 2;

  const points = formArray
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
          formArray.length >= 2 && (
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
                onChange={e => onChangeField("fundo", e.target.value)}
              />
            </StandardInput>
            <StandardInput label="Cor da borda">
              <Form.Control
                type="color"
                value={formAparencia.borda}
                onChange={e => onChangeField("borda", e.target.value)}
              />
            </StandardInput>
            <StandardInput label="Espessura da borda">
              <Form.Control
                type="number"
                min={1}
                value={formAparencia.espessura}
                onChange={e => onChangeField("espessura", Number(e.target.value))}
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
                onChange={e => onChangeField("geometria", e.target.value)}
              >
                {renderOptions({
                  list: GEOMETRIAS,
                  placeholder: "Selecione a geometria",
                })}
              </Form.Select>
            </StandardInput>
          </Col>
          {formAparencia.geometria === "polygon" && <Col md={6}>
            <ListaArray
              dados = {formArray}
              colunas = {[
                {rotulo: "x", render: (item, idx) => <Form.Control
                  type="number"
                  size="sm"
                  value={item.x}
                  onChange={e => onChangeArrElementProp(idx, "x", e.target.value)}
                />},
                {rotulo: "y", render: (item, idx) => <Form.Control
                  type="number"
                  size="sm"
                  value={item.y}
                  onChange={e => onChangeArrElementProp(idx, "y", e.target.value)}
                />},
              ]}
              onAdd={onAddArrElement}
              addLabel="+ Adicionar ponto"
              onRemove={onRemoveArrElement}
              showIndex
            />
          </Col>}
        </Row>
      </StandardCard>
    </>
  );
}
