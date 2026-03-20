import { Form, InputGroup } from "react-bootstrap";

export default function CvJobRunExecucaoTab({ form, setForm }) {
  return (
    <>
      <InputGroup className="mb-3">
        <InputGroup.Text>Worker</InputGroup.Text>
        <Form.Control
          value={form.workerId}
          onChange={e => setForm({ workerId: e.target.value })}
        />
      </InputGroup>

      <InputGroup className="mb-3">
        <InputGroup.Text>Início</InputGroup.Text>
        <Form.Control
          type="datetime-local"
          value={form.startedAt}
          onChange={e => setForm({ startedAt: e.target.value })}
        />

        <InputGroup.Text>Fim</InputGroup.Text>
        <Form.Control
          type="datetime-local"
          value={form.finishedAt}
          onChange={e => setForm({ finishedAt: e.target.value })}
        />
      </InputGroup>

      <InputGroup className="mb-3">
        <InputGroup.Text>Duração (ms)</InputGroup.Text>
        <Form.Control
          type="number"
          value={form.durationMs}
          onChange={e => setForm({ durationMs: Number(e.target.value) })}
        />

        <InputGroup.Text>Tentativas</InputGroup.Text>
        <Form.Control
          type="number"
          value={form.retries}
          onChange={e => setForm({ retries: Number(e.target.value) })}
        />
      </InputGroup>
    </>
  );
}
