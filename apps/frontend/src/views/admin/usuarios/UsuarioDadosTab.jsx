
import { Form } from "react-bootstrap";
import BaseTab from "../../../components/common/BaseTab";
import { StandardInput } from "../../../utils/formUtils";

export default function UsuarioDadosTab({ form, setForm, }) {
  return (
      <>
      <BaseTab
        form = {form}
        setForm = {setForm}
      >
        <StandardInput label = "Apelido">
          <Form.Control
            value={form.apelido}
            onChange={e => setForm({...form, apelido: e.target.value})}
            required
          />
        </StandardInput>
        <StandardInput label = "email">
          <Form.Control
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
            required
          />
        </StandardInput>
      </BaseTab>
    </>
  )
}