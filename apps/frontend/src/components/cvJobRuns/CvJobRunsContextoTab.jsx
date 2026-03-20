import { Form, InputGroup } from "react-bootstrap";

export default function CvJobRunContextoTab({ form, setForm }) {
  return (
    <>
      <InputGroup className="mb-3">
        <InputGroup.Text>Tipo Entidade</InputGroup.Text>
        <Form.Control
          value={form.tipoEntidadeId}
          onChange={e => setForm({ tipoEntidadeId: e.target.value })}
        />
      </InputGroup>

      <InputGroup className="mb-3">
        <InputGroup.Text>Entidade ID</InputGroup.Text>
        <Form.Control
          value={form.entidadeId}
          onChange={e => setForm({ entidadeId: e.target.value })}
        />
      </InputGroup>

      <InputGroup className="mb-3">
        <InputGroup.Text>Entidade Nome</InputGroup.Text>
        <Form.Control
          value={form.entidadeNome}
          onChange={e => setForm({ entidadeNome: e.target.value })}
        />
      </InputGroup>
    </>
  );
}
