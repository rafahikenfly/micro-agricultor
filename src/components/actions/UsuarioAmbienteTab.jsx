import { Container, Button, Row, Col } from "react-bootstrap";

export default function UsuarioAmbienteTab({
  acessos = {},
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

  const ambientesDisponiveis = ambientes.filter(
    (a) => acessos[a.key]
  );

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
          {ambientesDisponiveis.map((ambiente) => (
            <Button
              key={ambiente.key}
              size="lg"
              variant={
                ambienteAtivo === ambiente.key
                  ? ambiente.variant
                  : "outline-secondary"
              }
              style={{ height: 100, fontSize: "1.2rem" }}
              onClick={() => onSelect(ambiente.key)}
            >
              {ambiente.label}
              {ambienteAtivo === ambiente.key && " ✓"}
            </Button>
          ))}
        </Col>
      </Row>
    </Container>
  );
}