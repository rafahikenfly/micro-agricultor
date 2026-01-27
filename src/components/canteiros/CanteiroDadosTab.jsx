import { Form, } from "react-bootstrap";

export default function CanteiroDadosTab({ form, setForm, estadosCanteiro}) {
  return (
    <Form className="p-3">
      <Form.Group>
        <Form.Label>Nome</Form.Label>
        <Form.Control
          value={form.nome}
          onChange={e => setForm({ ...form, nome: e.target.value })}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Descrição</Form.Label>
        <Form.Control
          as="textarea"
          value={form.descricao}
          onChange={e => setForm({ ...form, descricao: e.target.value })}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Estado</Form.Label>
        <Form.Select
          value={form.estado}
          onChange={e => setForm({ ...form, estadoId: e.target.value })}
        >
          <option>Selecione</option>
          {estadosCanteiro.map((s)=>(
            <option key={s.id} value={s.id}>{s.nome}</option>
            ))
          }
        </Form.Select>
      </Form.Group>

    </Form>
  );
}
