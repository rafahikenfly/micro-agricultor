import { Container, Button, Row, Col } from "react-bootstrap";
import { AMBIENTE } from "@shared/types/AMBIENT_TYPES";

export default function UsuarioAmbienteTab({
  acesso = {},
  ambienteAtivo,
  onSelect,
}) {
  const ambientes = [
    {
      key: "admin",
      label: "🌱 Painel Administrativo",
      variant: "success",
    },
    {
      key: "usuario",
      label: "🌿 Visualizar Horta",
      variant: "outline-success",
    },
    {
      key: "developer",
      label: "🛠️ Ambiente Developer",
      variant: "outline-secondary",
    },
  ];

  const ambientesDisponiveis = Object.values(AMBIENTE).filter((a) => acesso[a.id]);

  if (!ambientesDisponiveis.length) {
    return (
      <p className="text-muted">
        Nenhum ambiente disponível para este usuário.
      </p>
    );
  }

  return (
    <Container fluid>
      <Row className="justify-content-center">
        <Col md={8} className="d-grid gap-3">
          {ambientesDisponiveis.map((modulo) => (
            <Button
              key={modulo.id}
              size="lg"
              variant={
                ambienteAtivo === modulo.id
                  ? modulo.variant
                  : "outline-secondary"
              }
              style={{ height: 100, fontSize: "1.2rem" }}
              onClick={() => onSelect(modulo.id)}
            >
              {modulo.ambiente}
              {ambienteAtivo === modulo.key && " ✓"}
            </Button>
          ))}
        </Col>
      </Row>
    </Container>
  );
}