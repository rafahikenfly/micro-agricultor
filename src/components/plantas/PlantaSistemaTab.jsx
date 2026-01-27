import { Form, } from "react-bootstrap";

export default function CanteiroSistemaTab({ form, setForm, }) {
  return (
    <>
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
        <Form.Label>CanteiroId</Form.Label>
        <Form.Control
          as="textarea"
          value={form.canteiroId}
          onChange={e => setForm({ ...form, canteiroId: e.target.value })}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>CanteiroNome</Form.Label>
        <Form.Control
          as="textarea"
          value={form.canteiroNome}
          onChange={e => setForm({ ...form, canteiroeNome: e.target.value })}
        />
      </Form.Group>
      
    </>
  );
}
