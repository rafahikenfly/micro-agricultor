import { Form, InputGroup } from "react-bootstrap";

export default function CvJobRunImagemTab({ form, setForm }) {
  return (
    <>
      <InputGroup className="mb-3">
        <InputGroup.Text>Path</InputGroup.Text>
        <Form.Control
          value={form.path}
          onChange={e => setForm({ path: e.target.value })}
        />
      </InputGroup>

      <InputGroup className="mb-3">
        <InputGroup.Text>Origem</InputGroup.Text>
        <Form.Control
          value={form.origem}
          onChange={e => setForm({ origem: e.target.value })}
        />
      </InputGroup>

      <InputGroup className="mb-3">
        <InputGroup.Text>Timestamp</InputGroup.Text>
        <Form.Control
          type="datetime-local"
          value={form.timestamp}
          onChange={e => setForm({ timestamp: e.target.value })}
        />
      </InputGroup>
    </>
  );
}
