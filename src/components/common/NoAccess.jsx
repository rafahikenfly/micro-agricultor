import React from 'react';
import { Alert, Container } from 'react-bootstrap';

function NoAccess({ ambiente }) {
    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <Alert variant="warning" className="w-100">
                <Alert.Heading>Accesso Negado</Alert.Heading>
                <p>
                    Sem acesso ao módulo {ambiente}. Por favor, entre em contato com o administrador do sistema para obter os privilégios necessários.
                </p>
            </Alert>
        </Container>
    );
}

export default NoAccess;