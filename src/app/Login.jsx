import { useEffect, useState } from "react";
import { Button, Form, Card } from "react-bootstrap";
import { useAuth } from "../services/auth/authContext";
import { db } from "../firebase";

export default function Login() {
  const { login } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [userId, setUserId] = useState("");


  useEffect(() => {
    return db.collection("usuarios")
      .orderBy("nome")
      .onSnapshot(s =>
        setUsuarios(s.docs.map(d => ({ id: d.id, ...d.data() })))
      );
  }, []);


  const entrar = (e) => {
    e.preventDefault();

    const userData = usuarios.find(p => p.id === userId);
    login({
      id: userId,
      nome: userData.nome,
      contexto: userData.contexto,
      tipo: "usuario",
    });
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: 320 }}>
        <Card.Body>
          <Card.Title>Login</Card.Title>

          <Form onSubmit={entrar}>
            <Form.Group className="mb-3">
              <Form.Label>Usuário</Form.Label>
              <Form.Select
                value={userId}
                onChange={e => setUserId(e.target.value)}
                required
              >
              <option>Selecione</option>
              {usuarios.map((u)=>(
                  <option key={u.id} value={u.id}>{u.nome}</option>
                  ))
              }
              </Form.Select>
            </Form.Group>
            <Button type="submit" className="w-100">
              Entrar
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
