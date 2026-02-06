import React from "react";
import { Form, Row, Col } from "react-bootstrap";
import { renderOptions } from "../../utils/formUtils";
import { GEOMETRIAS } from "../../utils/consts/GEOMETRIAS";

export default function AparenciaTab({ value, onChange }) {
  const update = (field, v) => {
    onChange({
      ...value,
      [field]: v
    });
  };
  return (
    <>
      <Row className="g-3">

        <Col md={6}>
          <Form.Group controlId="aparencia-fundo">
            <Form.Label>Cor de fundo</Form.Label>
            <Form.Control
              type="color"
              value={value.fundo}
              onChange={e => update("fundo", e.target.value)}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group controlId="aparencia-borda">
            <Form.Label>Cor da borda</Form.Label>
            <Form.Control
              type="color"
              value={value.borda}
              onChange={e => update("borda", e.target.value)}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group controlId="aparencia-espessura">
            <Form.Label>Espessura da borda</Form.Label>
            <Form.Control
              type="number"
              min={1}
              value={value.espessura}
              onChange={e => update("espessura", Number(e.target.value))}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group controlId="aparencia-geometria">
            <Form.Label>Geometria</Form.Label>

            <Form.Select
              value={value.geometria || ""}
              onChange={e => update("geometria", e.target.value)}
            >
              {renderOptions({
                list: GEOMETRIAS,
                placeholder: "Selecione a geometria",
              })}
            </Form.Select>
          </Form.Group>
        </Col>

      </Row>
    </>
  );
}
