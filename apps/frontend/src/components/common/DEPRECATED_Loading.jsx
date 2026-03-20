import Spinner from 'react-bootstrap/Spinner';

//TODO: DIFERENTES LOADINGS PARA DIFERENTES CONTEXTOS
export default function Loading({height}) {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: height ?? '200px' }}>
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    );
}