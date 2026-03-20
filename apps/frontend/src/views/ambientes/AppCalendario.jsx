import { useEffect, useState, useMemo } from "react";
import { eventosService } from "../../services/history/eventosService";
import { tarefasService } from "../../services/crud/tarefasService";
import { Calendario } from "../calendario/Calendario";
import { useAuth } from "../../services/auth/authContext";
import Loading from "../../components/common/Loading";
import { Container, Nav, Navbar } from "react-bootstrap";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import NoAccess from "../../components/common/NoAccess";
import Perfil from "../profile/Perfil";

export default function AppCalendario() {
  const {user} = useAuth();
  if (!user?.acesso?.usuario) return <NoAccess ambiente={"calendario"} />;
  return (
    <>
      {/* Navbar */}
      <Navbar bg="success" variant="dark" expand="sm">
        <Container>
          <Navbar.Brand>
          🌱 Minha Horta
          </Navbar.Brand>
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
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Routes>
          <Route index element={<Calendario />} />
          <Route path="perfil" element={<Perfil />} />
        </Routes>
      </Container>
    </>
  )
}