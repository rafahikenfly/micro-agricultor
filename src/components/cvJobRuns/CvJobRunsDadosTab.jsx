import { Form, InputGroup } from "react-bootstrap";
import { handleSelectIdNome, renderOptions } from "../../utils/formUtils";
import { JOBRUN_STATE } from "@shared/types/JOBRUN_STATE";

export default function CvJobRunDadosTab({ form, setForm, loading }) {
  return (
    <>
      <InputGroup className="mb-3">
        <InputGroup.Text>Nome</InputGroup.Text>
        <Form.Control
          value={form.nome}
          onChange={e => setForm({ nome: e.target.value })}
        />
      </InputGroup>

      <InputGroup className="mb-3">
        <InputGroup.Text>Estado</InputGroup.Text>
        <Form.Select
          value={form.estado}
          onChange={e =>
            handleSelectIdNome(e, {
              list: JOBRUN_STATE,
              setForm,
              fieldId: "estado",
              fieldNome: "estadoNome",
            })
          }
        >
          {renderOptions({
            list: JOBRUN_STATE,
            loading,
            placeholder: "Estado não definido",
          })}
        </Form.Select>
      </InputGroup>
    </>
  );
}
