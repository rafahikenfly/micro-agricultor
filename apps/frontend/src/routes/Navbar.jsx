import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Container, Nav, Navbar, Dropdown } from "react-bootstrap";
import { useAuth } from "../services/auth/authContext";
import { hortaService } from "../services/crud/hortaService";
import { usuariosService } from "../services/crud/usuariosService";
import Loading from "../components/Loading";

export default function AppNavbar() {
  const {user} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [hortas, setHortas] = useState([]);
  const [hortaSelecionada, setHortaSelecionada] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================== CARREGAR DADOS ================== */
  useEffect(() => {
    if (!user) return;
  
      setLoading(true);
  
      const unsub = hortaService.subscribe((data) => {
        setHortas(data);
        setLoading(false); // só desliga quando os dados chegam
      },
      [
        { field: "isDeleted", op: "==", value: false },
        { field: "membros", op: "array-contains", value: user.uid },
      ]);
  
      return unsub;
  }, [user]);

  useEffect(() => {
    if (!hortaSelecionada && user?.contexto?.hortaAtivaId && hortas.length > 0) {
      const hortaAtiva = hortas.find(
        h => h.id === user.contexto.hortaAtivaId
      );
      if (hortaAtiva) {
        setHortaSelecionada(hortaAtiva);
      }
    }
  }, [hortas, user, hortaSelecionada]);
  

  /* ================= HANDLERS ================= */
  const selecionaHorta = async (data) => {
    const segments = location.pathname.split("/");
    const view = segments[1] || "mapa";
    navigate(`/${view}/${data.id}`);
    usuariosService.update(usuariosService.getRefById(user.uid),{
      ...user,
      contexto: {
        ...user.contexto,
        hortaAtivaId: data.id
      }
    },)
    setHortaSelecionada(data)
  }

  
  return (
    <Navbar bg="success" variant="dark" expand="sm">
      <Container>
        <Navbar.Brand>
        🌱 Minha Horta
          {hortaSelecionada && (
            <small className="ms-2 text-light">
              {hortaSelecionada.nome}
            </small>
          )}   
        </Navbar.Brand>

        <Nav className="me-auto">
          <Nav.Link as={NavLink} to="/mapa">
            Mapa
          </Nav.Link>
          <Nav.Link as={NavLink} to="/calendario">
            Calendário
          </Nav.Link>
          <Nav.Link as={NavLink} to="/admin">
            Admin
          </Nav.Link>
        </Nav>

        <Nav className="ms-auto">
          {loading ? <Loading variant="button" /> : 
          <Dropdown align="end">
            <Dropdown.Toggle variant="success">Hortas</Dropdown.Toggle>
            <Dropdown.Menu>
              {hortas.length === 0 && (
                <Dropdown.Item disabled>Nenhuma horta</Dropdown.Item>
              )}

              {hortas.map((horta) => (
                <Dropdown.Item
                  key={horta.id}
                  active={horta.id === hortaSelecionada?.id}
                  onClick={() => selecionaHorta(horta)}
                >
                  {horta.nome}
                </Dropdown.Item>
              ))}              
            </Dropdown.Menu>
          </Dropdown>}

          {user && (
            <Nav.Link
              as={NavLink}
              to="/perfil"
              className="ms-3 fw-semibold text-light"
            >
              {user.apelido || user.nome}
            </Nav.Link>
          )}

        </Nav>
      </Container>
    </Navbar>
  );
}