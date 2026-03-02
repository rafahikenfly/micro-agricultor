import { useState, useEffect } from "react";
import { useAuth} from "../../services/auth/authContext"

import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { Container, Nav, Navbar, Dropdown } from "react-bootstrap";
import { Mapa } from "../mapa/Mapa";
import Perfil from "../profile/Perfil";

import { db, timestamp } from "../../firebase";
import NoAccess from "../../components/common/NoAccess";
import { hortaService } from "../../services/crud/hortaService";


export default function AppMapa() {
  const {user} = useAuth();
  if (!user?.acesso?.usuario) return <NoAccess ambiente={"mapa"} />;

  const [hortas, setHortas] = useState([]);
  const [hortaSelecionada, setHortaSelecionada] = useState(null);

  const [loading, setLoading] = useState(false);

  /* ================== CARREGAR DADOS ================== */
  //TODO: USAR CRUD SERVICES
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
    const userRef = db.collection("usuarios").doc(user.uid)

    await userRef.update({
      "contexto.hortaAtivaId": data.id,
      "contexto.updatedAt": timestamp(),
    });

    setHortaSelecionada(data)
  }

  return (
    <>
      {/* Navbar */}
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

          <Nav className="ms-auto">
            {/* Dropdown com listas */}
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
            </Dropdown>

            {/* Nome do usuário */}
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

      {/* Conteúdo principal */}
      <Container className="mt-4">
        <Routes>
          <Route index element={<Navigate to="/mapa" />} />
          <Route path="mapa" element={<Mapa user={user} horta={hortaSelecionada}/>} setHortaSelecionadaNavbar={setHortaSelecionada}/>
          <Route path="perfil" element={<Perfil />} />
        </Routes>
      </Container>
    </>
  );
}
