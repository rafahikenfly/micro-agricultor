import { Form, Row, Col } from "react-bootstrap";
import { StandardInput } from "../../utils/formUtils";

export default function VetorTab({
  formVetor, setVetor
}) {
  const update = (field, v) => {  setVetor({ ...formVetor, [field]: v  }); };

  return (
    <>
      <Row className="g-2">
        <Col md={4}>
          <StandardInput label="x">
            <Form.Control
              type="number"
              value={formVetor.x}
              onChange={(e) => update("x", Number(e.target.value))}
            />
          </StandardInput>
        </Col>
        <Col md={4}>
          <StandardInput label="y">
            <Form.Control
              type="number"
              value={formVetor.y}
              onChange={(e) => update("y", Number(e.target.value))}
            />
          </StandardInput>
        </Col>
        <Col md={4}>
          <StandardInput label="z">
            <Form.Control
              type="number"
              value={formVetor.z}
              onChange={(e) => update("z", Number(e.target.value))}
            />
          </StandardInput>
        </Col>
      </Row>
    </>
  );
}
