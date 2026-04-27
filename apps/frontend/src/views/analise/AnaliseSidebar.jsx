import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

export default function AnaliseSidebar() {
  return (
    <div
      className="bg-light border-end"
      style={{
        width: "240px",
        minHeight: "calc(100vh - 56px)"
      }}
    >
      <Nav className="flex-column p-3">

        <Nav.Link as={NavLink} to="/analise/solicitar">
          Solicitações
        </Nav.Link>
        <hr />


        <div className="text-muted small mb-2">Relatórios</div>
        <Nav.Link as={NavLink} to="/analise/evolucaoCaracteristica">
          Evolução de características
        </Nav.Link>
        <hr />

        <div className="text-muted small mb-2">Visão Computacional</div>

        <Nav.Link as={NavLink} to="/analise/inferencia">
          Inferências
        </Nav.Link>
        <hr />

      </Nav>
    </div>
  );
}