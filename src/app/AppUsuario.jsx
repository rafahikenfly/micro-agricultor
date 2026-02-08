import { useState, useEffect } from "react";
import { useAuth} from "../services/auth/authContext"

import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { Container, Nav, Navbar, Dropdown } from "react-bootstrap";
import { Mapa } from "../views/mapa/Mapa";
import Calendario from "../views/Calendario";
import Perfil from "../views/Perfil";

import { db, timestamp } from "../firebase";
import NoAccess from "../components/common/NoAccess";


export default function AppUsuario() {
  const {user} = useAuth();
  if (!user?.acesso?.usuario) return <NoAccess ambiente={ambiente} />;

  const [hortas, setHortas] = useState([]);
  const [hortaSelecionada, setHortaSelecionada] = useState(null);

  /* ================== CARREGAR DADOS ================== */
  useEffect(() => {
    if (!user) return;
  
    return db
      .collection("hortas")
//      .where("usuarioId", "==", user.id) TODO: Filtrar lista de hortas por usuario
      .onSnapshot((snap) => {
        const lista = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHortas(lista);
      });
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
    const userRef = db.collection("usuarios").doc(user.id)

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
            <Nav.Link
              as={NavLink}
              to="/usuario/mapa">
              Mapa
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/usuario/calendario">
              Calendário
            </Nav.Link>

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
                to="/usuario/perfil"
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
          <Route index element={<Navigate to="mapa" />} />
          <Route path="mapa" element={<Mapa user={user} horta={hortaSelecionada}/>} setHortaSelecionadaNavbar={setHortaSelecionada}/>
          <Route path="calendario" element={<Calendario />} />
          <Route path="perfil" element={<Perfil />} />
        </Routes>
      </Container>
    </>
  );
}
