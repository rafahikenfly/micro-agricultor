import React from "react";
import { useAuth } from "../../services/auth/authContext";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";

// GERENCIAR
import HortasCRUD from "../admin/hortas/HortasCRUD";
import CanteirosCRUD from "../admin/canteiros/CanteirosCRUD";
import PlantasCRUD from "../admin/plantas/PlantasCRUD";

// CANTEIRO
import EstadosCanteiroCRUD from "../admin/estadosCanteiros/EstadosCanteiroCRUD";

// ESPECIE
import VariedadesCRUD from "../admin/variedades/VariedadesCRUD";
import EspeciesCRUD from "../admin/especies/EspeciesCRUD";

//...

// TAREFA
import TarefasCRUD from "../admin/tarefas/TarefasCRUD";

// CONFIG
import CaracteristicasCRUD from "../admin/caracteristicas/CaracteristicasCRUD";

// UNDER REVIEW
import ManejosCRUD from "../../components/manejos/ManejosCRUD";
import UsuariosCRUD from "../../components/usuarios/UsuariosCRUD";
import EstagiosEspecieCRUD from "../../components/tabelas/estagios/EstagiosEspecieCRUD";
import EstadosPlantaCRUD from "../../components/tabelas/estados/EstadosPlantaCRUD";
import NoAccess from "../../components/common/NoAccess";
import Perfil from "../profile/Perfil";
import CategoriasCRUD from "../../components/tabelas/categorias/CategoriasCRUD";
import CvJobSpecsCRUD from "../../components/cvJobsSpecs/CVJobSpecsCRUD";
import CvJobRunsCRUD from "../../components/cvJobRuns/CvJobRunsCRUD";
import CvModelosCRUD from "../../components/cvModelos/CvModelosCRUD";

function AppAdmin() {
  const { user } = useAuth();

  if (!user?.acesso?.usuario) {
    return <NoAccess ambiente="admin" />;
  }

  return (
    <>
      {/* Navbar */}
      <Navbar bg="success" variant="dark" expand="lg" sticky="top">
        <Container fluid>
          <Navbar.Brand
            as={NavLink}
            to="especies"
            style={{ fontWeight: "bold" }}
          >
            Minha Horta 🌱
          </Navbar.Brand>

          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="me-auto">

              {/* Entidades */}
              <NavDropdown title="Gerenciamento">
                <NavDropdown.Item as={NavLink} to="/admin/hortas">
                  Gerenciar Hortas
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/admin/canteiros">
                  Gerenciar Canteiros
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/admin/plantas">
                  Gerenciar Plantas
                </NavDropdown.Item>
              </NavDropdown>

              {/* Canteiros */}
              <NavDropdown title="Canteiros">
                <NavDropdown.Item as={NavLink} to="/admin/estadosCanteiro">
                  Estados dos Canteiros
                </NavDropdown.Item>
              </NavDropdown>

              {/* Cultivos */}
              <NavDropdown title="Cultivos">
                <NavDropdown.Item as={NavLink} to="/admin/especies">
                  Espécies
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/admin/variedades">
                  Variedades
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/admin/categorias_especie">
                  Categorias
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/admin/estadosPlanta">
                  Estados das Plantas
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/admin/estagiosEspecie">
                  Estágios
                </NavDropdown.Item>
              </NavDropdown>

              {/* Manejos */}
              <NavDropdown title="Manejos">
                <NavDropdown.Item as={NavLink} to="/admin/caracteristicas">
                  Características
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/admin/cvJobSpecs">
                  Definições CV
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/admin/cvModelos">
                  Modelos CV
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/admin/manejos">
                  Tipos de Manejo
                </NavDropdown.Item>
              </NavDropdown>

              {/* Usuários */}
              <NavDropdown title="Usuários">
                <NavDropdown.Item as={NavLink} to="/admin/usuarios">
                  Gerenciar Usuários
                </NavDropdown.Item>
              </NavDropdown>

              {/* Tarefas */}
              <NavDropdown title="Tarefas">
                <NavDropdown.Item as={NavLink} to="/admin/tarefas">
                  Tarefas
                </NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/admin/cvJobRuns">
                  Tarefas de Visão Computacional
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>

            {user && (
              <Nav.Link
                as={NavLink}
                to="/admin/perfil"
                className="ms-3 fw-semibold text-light"
              >
                {user.apelido || user.nome}
              </Nav.Link>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Conteúdo */}
      <main className="p-4">
        <Routes>
          <Route index element={<Navigate to="hortas" />} />

          <Route path="hortas" element={<HortasCRUD />} />
          <Route path="canteiros" element={<CanteirosCRUD />} />
          <Route path="plantas" element={<PlantasCRUD />} />

          <Route path="especies" element={<EspeciesCRUD />} />
          <Route path="variedades" element={<VariedadesCRUD />} />
          <Route path="manejos" element={<ManejosCRUD />} />
          <Route path="usuarios" element={<UsuariosCRUD />} />
          <Route path="categorias_especie" element={<CategoriasCRUD />} />
          <Route path="caracteristicas" element={<CaracteristicasCRUD />} />
          <Route path="estagiosEspecie" element={<EstagiosEspecieCRUD />} />
          <Route path="estadosPlanta" element={<EstadosPlantaCRUD />} />
          <Route path="estadosCanteiro" element={<EstadosCanteiroCRUD />} />
          <Route path="cvJobSpecs" element={<CvJobSpecsCRUD />} />
          <Route path="cvJobRuns" element={<CvJobRunsCRUD />} />
          <Route path="tarefas" element={<TarefasCRUD />} />
          <Route path="cvModelos" element={<CvModelosCRUD />} />
          <Route path="perfil" element={<Perfil />} />
        </Routes>
      </main>
    </>
  );
}

export default AppAdmin;