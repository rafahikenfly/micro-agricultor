import { Form, } from "react-bootstrap";
import { JOBRUN_STATE } from "@shared/types/JOBRUN_STATE";
import { RECURRING } from "@shared/types/RECURRING_TYPES";

import { renderOptions, StandardInput } from "../../../utils/formUtils";

import BaseTab from "../../../components/common/BaseTab";
import { REASON } from "../../../../shared/types/REASON_TYPES";

export default function TarefaDadosTab({ form, setForm }) {
  return (
    <BaseTab
      form={form}
      setForm={setForm}
    >
      <StandardInput label="Motivo">
        <Form.Select
          value={form.motivo}
          onChange={e => setForm({...form, motivo: e.target.value})}
        >
          {renderOptions({
            list: Object.values(REASON),
            placeholder: "Selecione o motivo da tarefa",
          })}
        </Form.Select>
      </StandardInput>

      <StandardInput label="Fingerprint">
        <Form.Control
          disabled
          value={form.fingerprint}
        />
      </StandardInput>
      <StandardInput label="Estado">
        <Form.Select
          value={form.estado}
          onChange={e => setForm({...form, estado: e.target.value})}
        >
          {renderOptions({
            list: JOBRUN_STATE,
            placeholder: "Selecione o estado da tarefa",
          })}
        </Form.Select>
      </StandardInput>
      <StandardInput label="Recorrência">
        <Form.Select>
          {renderOptions({
            list: Object.values(RECURRING),
            placeholder: "Selecione a frequência",
          })}
        </Form.Select>
      </StandardInput>
    </BaseTab>
  );
}
