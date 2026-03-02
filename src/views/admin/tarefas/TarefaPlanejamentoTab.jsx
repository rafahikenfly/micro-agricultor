import { Form, } from "react-bootstrap";
import { JOBRUN_STATE } from "@shared/types/JOBRUN_STATE";
import { RECURRING } from "@shared/types/RECURRING_TYPES";

import { renderOptions, StandardInput } from "../../../utils/formUtils";

import BaseTab from "../../../components/common/BaseTab";
import { toDateTimeLocal } from "../../../utils/dateUtils";
import { EVENTO } from "../../../../functions/shared/types/EVENTO_TYPES";

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
        <StandardInput label="Recomendação">
          <Form.Select
            value={formPlanejamento.recomendacao}
            onChange={e => setForm({...formPlanejamento, recomendacao: e.target.value})}
          >
            {renderOptions({
              list: Object.values(EVENTO),
              placeholder: "Selecione a recomendacao de resolução da tarefa",
            })}
          </Form.Select>
        </StandardInput>
    </>
  );
}
