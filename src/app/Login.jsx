import { useState } from "react";
import { Button, Form, Card, Alert } from "react-bootstrap";
import { useAuth } from "../services/auth/authContext";
import { auth, db } from "../firebase";

export default function Login() {
  const { login } = useAuth();

  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);

  const entrar = async (e) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      if (modoCadastro) {
        // 🔹 Criar usuário no Firebase Auth
        const cred = await auth.createUserWithEmailAndPassword(email, password);

        // 🔹 Criar documento no Firestore
        await db.collection("usuarios").doc(cred.user.uid).set({
          nome,
          apelido,
          email,
          acesso: {
            usuario: true,
            admin: false
          },
          contexto: {},
          uid: cred.user.uid,
          isDeleted: false,
          isArchived: false,
          createdAt: new Date(),
        });

      } else {
        await login(email, password);
      }

    } catch (err) {
      setErro(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: 350 }}>
        <Card.Body>
          <Card.Title>
            {modoCadastro ? "Criar Conta" : "Login"}
          </Card.Title>

          {erro && <Alert variant="danger">{erro}</Alert>}

          <Form onSubmit={entrar}>

            {modoCadastro && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Apelido</Form.Label>
                  <Form.Control
                    value={apelido}
                    onChange={(e) => setApelido(e.target.value)}
                  />
                </Form.Group>
              </>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Senha</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" className="w-100 mb-2" disabled={loading}>
              {loading
                ? "Processando..."
                : modoCadastro
                  ? "Criar Conta"
                  : "Entrar"}
            </Button>

            <Button
              variant="link"
              className="w-100"
              onClick={() => setModoCadastro(!modoCadastro)}
            >
              {modoCadastro
                ? "Já tem conta? Fazer login"
                : "Não tem conta? Criar conta"}
            </Button>

          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}