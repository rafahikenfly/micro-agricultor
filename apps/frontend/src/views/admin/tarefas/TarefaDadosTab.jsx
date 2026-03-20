import { Form, } from "react-bootstrap";

import { renderOptions, StandardInput } from "../../../utils/formUtils";

import BaseTab from "../../../components/common/BaseTab";
import { CVRUN_ESTADO } from "micro-agricultor/types";

export default function TarefaDadosTab({ form, setForm }) {
  return (
    <BaseTab
      form={form}
      setForm={setForm}
    >
      <StandardInput label="Estado">
        <Form.Select
          value={form.estado}
          onChange={e => setForm({...form, estado: e.target.value})}
        >
          {renderOptions({
            list: Object.values(CVRUN_ESTADO),
            placeholder: "Selecione o estado da tarefa",
          })}
        </Form.Select>
      </StandardInput>
    </BaseTab>
  );
}
