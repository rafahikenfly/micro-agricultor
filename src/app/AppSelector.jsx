import { Container, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function AppSelector() {
  const navigate = useNavigate();

  return (
    <Container
      fluid
      className="vh-100 d-flex align-items-center justify-content-center"
    >
      <Row className="w-100 justify-content-center">
        <Col md={4} className="d-grid gap-4">
          <Button
            size="lg"
            variant="success"
            style={{ height: "120px", fontSize: "1.5rem" }}
            onClick={() => navigate("/admin")}
          >
            🌱 Painel Administrativo
          </Button>

          <Button
            size="lg"
            variant="outline-success"
            style={{ height: "120px", fontSize: "1.5rem" }}
            onClick={() => navigate("/usuario")}
          >
            🌿 Visualizar Horta
          </Button>
        </Col>
      </Row>
    </Container>
  );
}
