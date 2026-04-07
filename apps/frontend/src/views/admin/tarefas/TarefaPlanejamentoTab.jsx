import { Form, } from "react-bootstrap";
import { RECORRENCIA } from "micro-agricultor";

import { renderOptions, StandardInput } from "../../../utils/formUtils";
import { toDateTimeLocal } from "../../../utils/dateUtils";

export default function TarefaPlanejamentoTab({ formPlanejamento, setFormPlanejamento }) {
  return (
    <>
      <StandardInput label="Prioridade">
        <Form.Control
          type="number"
          step="1"
          value={formPlanejamento.prioridade}
          onChange={(e) => setFormPlanejamento({  ...formPlanejamento, prioridade: e.target.value }) }
        />
      </StandardInput>
      <StandardInput label="Vencimento">
        <Form.Control
          type="datetime-local"
          value={toDateTimeLocal(new Date(formPlanejamento.vencimento))}
          onChange={(e) => setFormPlanejamento({  ...formPlanejamento, vencimento: new Date(e.target.value).getTime()}) }
        />
      </StandardInput>
      <StandardInput label="Recorrência">
        <Form.Select
          value={formPlanejamento.recorrencia}
          onChange={(e)=> setFormPlanejamento({ ...formPlanejamento, recorrencia: e.target.value})}
        >
          {renderOptions({
            list: Object.values(RECORRENCIA),
            placeholder: "Selecione a frequência",
          })}
        </Form.Select>
      </StandardInput>
    </>
  );
}
