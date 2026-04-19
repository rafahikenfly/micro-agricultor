import { Form } from "react-bootstrap";
import { AMBIENTE } from "@shared/types/AMBIENT_TYPES";

export default function UsuarioAcessosTab({ form, setForm }) {
  if (!form.acesso) form.acesso = {}
  return (
    <>
    {Object.values(AMBIENTE).map((a)=> (
      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          id={`acesso-${a.id}`}
          label={a.nome}
          checked={!!form.acesso?.[a.id]}
          onChange={(e) => setForm({...form, acesso: {...form.acesso, [a.id]: e.target.checked}})}
        />
      </Form.Group>
    ))}
    </>
  );
}