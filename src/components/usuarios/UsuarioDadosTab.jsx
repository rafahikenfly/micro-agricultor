
import { Form } from "react-bootstrap";

export default function UsuarioDadosTab({ form, setForm, }) {
  return (
      <>
        <Form.Group className="mb-3">
          <Form.Label>Nome</Form.Label>
          <Form.Control
            value={form.nome}
            onChange={e => setForm({...form, nome: e.target.value})}
            required
          />
        </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Apelido</Form.Label>
              <Form.Control
                value={form.nomeExibicao}
                onChange={e => setForm({...form, apelido: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                value={form.descricao}
                onChange={e => setForm({...form, descricao: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>email</Form.Label>
              <Form.Control
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
              />
            </Form.Group>
    </>
  )
}