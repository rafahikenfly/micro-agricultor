import { Container, } from "react-bootstrap";

export function NoUser() {
    return (
        <Container fluid className="p-4 text-center">
            <h5>Sem usuário</h5>
            <p>É necessário estar autenticado para acessar o componente.</p>
        </Container>
    )
}
