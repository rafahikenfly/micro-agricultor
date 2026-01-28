import { Form } from "react-bootstrap";

export default function UsuarioAcessosTab({ acessos, setAcessos }) {
  const toggle = (key) => {
    setAcessos({
      ...acessos,
      [key]: !acessos[key],
    });
  };

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          id="acesso-admin"
          label="Administrador"
          checked={!!acessos.admin}
          onChange={() => toggle("admin")}
        />
      </Form.Group>

      <Form.Group>
        <Form.Check
          type="checkbox"
          id="acesso-usuario"
          label="Usuário"
          checked={!!acessos.usuario}
          onChange={() => toggle("usuario")}
        />
      </Form.Group>
    </>
  );
}