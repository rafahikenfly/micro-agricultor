import React from "react";
import { Form, InputGroup, Row, Col } from "react-bootstrap";

export default function VetorTab({
  value = { x: 0, y: 0, z: 0 },
  onChange
}) {
  const update = (field, v) => {
    onChange({
      ...value,
      [field]: v
    });
  };

  return (
    <Form>
      <Row className="g-2">
        <Col md={4}>
          <InputGroup>
            <InputGroup.Text>X</InputGroup.Text>
            <Form.Control
              type="number"
              value={value.x}
              onChange={e => update("x", Number(e.target.value))}
            />
          </InputGroup>
        </Col>

        <Col md={4}>
          <InputGroup>
            <InputGroup.Text>Y</InputGroup.Text>
            <Form.Control
              type="number"
              value={value.y}
              onChange={e => update("y", Number(e.target.value))}
            />
          </InputGroup>
        </Col>

        <Col md={4}>
          <InputGroup>
            <InputGroup.Text>Z</InputGroup.Text>
            <Form.Control
              type="number"
              value={value.z}
              onChange={e => update("z", Number(e.target.value))}
            />
          </InputGroup>
        </Col>
      </Row>
    </Form>
  );
}
