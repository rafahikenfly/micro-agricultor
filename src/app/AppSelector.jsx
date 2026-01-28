import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import { useAuth } from "../services/auth/authContext";

export default function AppSelector() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const ambienteAtivo = user.ambienteAtivo || "usuario";

    navigate(`/${ambienteAtivo}`, { replace: true });
  }, [user, navigate]);

  return (
    <Container className="vh-100 d-flex align-items-center justify-content-center">
      <Spinner animation="border" />
    </Container>
  );
}
