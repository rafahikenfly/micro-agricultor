import { Form, Row, Col } from "react-bootstrap";
import { StandardCard, StandardInput } from "../../utils/formUtils";

export default function VetorTab({
  formVetor, setVetor, header
}) {
  const update = (field, v) => {  setVetor({ ...formVetor, [field]: v  }); };

  return (
    <StandardCard header={header || "Dimensão"} >
      <Row className="g-2">
        <Col md={4}>
          <StandardInput label="x" width="40px" unidade="cm" unidadeWidth="50px">
            <Form.Control
              type="number"
              value={formVetor.x}
              onChange={(e) => update("x", Number(e.target.value))}
            />
          </StandardInput>
        </Col>
        <Col md={4}>
          <StandardInput label="y" width="40px" unidade="cm" unidadeWidth="50px">
            <Form.Control
              type="number"
              value={formVetor.y}
              onChange={(e) => update("y", Number(e.target.value))}
            />
          </StandardInput>
        </Col>
        <Col md={4}>
          <StandardInput label="z" width="40px" unidade="cm" unidadeWidth="50px">
            <Form.Control
              type="number"
              value={formVetor.z}
              onChange={(e) => update("z", Number(e.target.value))}
            />
          </StandardInput>
        </Col>
      </Row>
    </StandardCard>
  );
}
