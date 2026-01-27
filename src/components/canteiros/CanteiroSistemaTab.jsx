import { Form, } from "react-bootstrap";

export default function CanteiroSistemaTab({ form, setForm, }) {
  return (
    <Form className="p-3">
      <Form.Group>
        <Form.Label>HortaId</Form.Label>
        <Form.Control
          value={form.hortaId}
          onChange={e => setForm({ ...form, hortaId: e.target.value })}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>HortaNome</Form.Label>
        <Form.Control
          as="textarea"
          value={form.hortaNome}
          onChange={e => setForm({ ...form, hortaNome: e.target.value })}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>EspecieId</Form.Label>
        <Form.Control
          as="textarea"
          value={form.especieId}
          onChange={e => setForm({ ...form, especieId: e.target.value })}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>EspecieNome</Form.Label>
        <Form.Control
          as="textarea"
          value={form.especieNome}
          onChange={e => setForm({ ...form, especieNome: e.target.value })}
        />
      </Form.Group>


    </Form>
  );
}
