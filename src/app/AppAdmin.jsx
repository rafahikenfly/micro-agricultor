import React, { useState } from "react";
import { useAuth} from "../services/auth/authContext"
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";

import EspeciesCRUD from "../components/especies/EspeciesCRUD";
import HortasCRUD from "../components/hortas/HortasCRUD";
import PlantasCRUD from "../components/plantas/PlantasCRUD";
import ManejosCRUD from "../components/manejos/ManejosCRUD";
import UsuariosCRUD from "../components/usuarios/UsuariosCRUD";
import EstagiosEspecieCRUD from "../components/tabelas/estagios/EstagiosEspecieCRUD";
import EstadosPlantaCRUD from "../components/tabelas/estados/EstadosPlantaCRUD";
import EstadosCanteiroCRUD from "../components/tabelas/estados/EstadosCanteiroCRUD";
import CVJobsCRUD from "../components/tabelas/cvJobs/CVJobsCRUD";
import VariedadesCRUD from "../components/variedades/variedadesCRUD";
import CaracteristicasCRUD from "../components/tabelas/caracteristicas/CaracteristicasCRUD";
import NoAccess from "../components/common/NoAccess";
import Perfil from "../views/Perfil";
import CanteirosCRUD from "../components/canteiros/CanteirosCRUD";
import CategoriasCRUD from "../components/tabelas/categorias/CategoriasCRUD";

function AppAdmin() {
  const {user} = useAuth();
  if (!user?.acesso?.usuario) return <NoAccess ambiente={"admin"}/>;

  const [telaAtiva, setTelaAtiva] = useState("especies");

  const renderTela = () => {
    switch (telaAtiva) {
      case "especies":
        return <EspeciesCRUD />;
      case "variedades":
        return <VariedadesCRUD />;
      case "hortas":
        return <HortasCRUD />;
      case "canteiros":
        return <CanteirosCRUD />;
      case "plantas":
        return <PlantasCRUD />;
      case "manejos":
        return <ManejosCRUD />;
      case "usuarios":
        return <UsuariosCRUD />;
      case "categorias_especie":
        return <CategoriasCRUD />;
      case "caracteristicas":
        return <CaracteristicasCRUD />;
      case "estagiosEspecie":
        return <EstagiosEspecieCRUD />;
      case "estadosPlanta":
        return <EstadosPlantaCRUD />;
      case "estadosCanteiro":
        return <EstadosCanteiroCRUD />;
      case "cvJobs":
        return <CVJobsCRUD />
      case "perfil":
        return <Perfil />
      default:
        return <EspeciesCRUD />;
    }
  };

  return (
    <>
    {/* Navbar superior */}
    <Navbar bg="success" variant="dark" expand="lg" sticky="top">
      <Container fluid>
        {/* Logo */}
        <Navbar.Brand
          style={{ cursor: "pointer", fontWeight: "bold" }}
          onClick={() => setTelaAtiva("home")}
        >
          Minha Horta 🌱
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">

            {/* Hortas */}
            <NavDropdown title="Hortas" id="nav-hortas">
              <NavDropdown.Item onClick={() => setTelaAtiva("hortas")}>
                Gerenciar Hortas
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => setTelaAtiva("canteiros")}>
                Gerenciar Canteiros
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => setTelaAtiva("plantas")}>
                Gerenciar Plantas
              </NavDropdown.Item>
            </NavDropdown>

            {/* Espécies e Variedades */}
            <NavDropdown title="Espécies" id="nav-especies">
              <NavDropdown.Item onClick={() => setTelaAtiva("especies")}>
                Espécies
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => setTelaAtiva("variedades")}>
                Variedades
              </NavDropdown.Item>
            </NavDropdown>

            {/* Estados */}
            <NavDropdown title="Estados" id="nav-estados">
              <NavDropdown.Item onClick={() => setTelaAtiva("estadosPlanta")}>
                Estados das Plantas
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => setTelaAtiva("estadosCanteiro")}>
                Estados dos Canteiros
              </NavDropdown.Item>
            </NavDropdown>

            {/* Estágios, Características */}
            <NavDropdown title="Configurações Agrícolas" id="nav-config">
              <NavDropdown.Item onClick={() => setTelaAtiva("categorias_especie")}>
                Categorias
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => setTelaAtiva("estagiosEspecie")}>
                Estágios
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => setTelaAtiva("caracteristicas")}>
                Características
              </NavDropdown.Item>
            </NavDropdown>

            {/* Manejos */}
            <NavDropdown title="Manejos" id="nav-manejos">
              <NavDropdown.Item onClick={() => setTelaAtiva("cvJobs")}>
                Tarefas de Visão Computacional
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => setTelaAtiva("manejos")}>
                Tipos de Manejo
              </NavDropdown.Item>
            </NavDropdown>

            {/* Usuários */}
            <NavDropdown title="Usuários" id="nav-usuarios">
              <NavDropdown.Item onClick={() => setTelaAtiva("usuarios")}>
                Gerenciar Usuários
              </NavDropdown.Item>
            </NavDropdown>

          </Nav>
            {/* Nome do usuário */}
            {user && (
              <Nav.Link
                onClick={() => setTelaAtiva("perfil")}
                className="ms-3 fw-semibold text-light"
              >
                {user.apelido || user.nome}
              </Nav.Link>
            )}

        </Navbar.Collapse>
      </Container>
    </Navbar>

    {/* Conteúdo principal */}
    <main className="p-4">
      {renderTela()}
    </main>
  </>
  );
}

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 20px",
    backgroundColor: "#2e7d32",
    color: "#fff"
  },
  title: {
    margin: 0
  },
  nav: {
    display: "flex",
    gap: "10px"
  },
  main: {
    padding: "20px"
  }
};

export default AppAdmin;
