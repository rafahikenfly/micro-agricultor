import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <div
      className="bg-light border-end"
      style={{
        width: "240px",
        minHeight: "calc(100vh - 56px)"
      }}
    >
      <Nav className="flex-column p-3">

        <div className="text-muted small mb-2">Gerenciamento</div>

        <Nav.Link as={NavLink} to="/admin/hortas">
          Hortas
        </Nav.Link>

        <Nav.Link as={NavLink} to="/admin/canteiros">
          Canteiros
        </Nav.Link>

        <Nav.Link as={NavLink} to="/admin/plantas">
          Plantas
        </Nav.Link>

        <hr />

        <div className="text-muted small mb-2">Cultivos</div>

        <Nav.Link as={NavLink} to="/admin/especies">
          Espécies
        </Nav.Link>

        <Nav.Link as={NavLink} to="/admin/variedades">
          Variedades
        </Nav.Link>

        <hr />
        <div className="text-muted small mb-2">Manejos</div>
        <Nav.Link as={NavLink} to="/admin/manejos">
          Manejos
        </Nav.Link>
        <Nav.Link as={NavLink} to="/admin/dispositivos">
          Dispositivos
        </Nav.Link>
        <Nav.Link as={NavLink} to="/admin/modelosCV">
          Modelos de Visão Computacional
        </Nav.Link>
        <hr />

        <div className="text-muted small mb-2">Configuração</div>
        <Nav.Link as={NavLink} to="/admin/caracteristicas">
          Características
        </Nav.Link>
        <Nav.Link as={NavLink} to="/admin/categorias-especies">
          Categorias de Espécies
        </Nav.Link>
        <Nav.Link as={NavLink} to="/admin/estagios-especies">
          Estágios de Espécies
        </Nav.Link>
        <Nav.Link as={NavLink} to="/admin/estados-canteiro">
          Estados de Canteiro
        </Nav.Link>
        <Nav.Link as={NavLink} to="/admin/estados-planta">
          Estados de Planta
        </Nav.Link>
        <hr />

        <div className="text-muted small mb-2">Sistema</div>
        <Nav.Link as={NavLink} to="/admin/tarefas">
          Tarefas
        </Nav.Link>
        <Nav.Link as={NavLink} to="/admin/midias">
          Mídia
        </Nav.Link>
        <Nav.Link as={NavLink} to="/admin/usuarios">
          Usuários
        </Nav.Link>

      </Nav>
    </div>
  );
}