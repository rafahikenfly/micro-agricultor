import { Form, } from "react-bootstrap";
import { RESOLUCAO } from "micro-agricultor";

import { renderOptions, StandardInput } from "../../../utils/formUtils";
import { toDateTimeLocal } from "../../../utils/dateUtils";

export default function TarefaResolucaoTab({ formResolucao, setFormResolucao }) {
  return (
    <>
      <StandardInput label="Resolução">
        <Form.Control
          type="datetime-local"
          value={toDateTimeLocal(new Date(formResolucao.timestamp))}
          onChange={(e) => setFormResolucao({  ...formResolucao, timestamp: new Date(e.target.value).getTime()}) }
        />
      </StandardInput>
      <StandardInput label="Tipo de Resolução">
        <Form.Select
          value={formResolucao.tipoResolucao}
          onChange={(e)=> setFormResolucao({ ...formResolucao, tipoResolucao: e.target.value})}
        >
          {renderOptions({
            list: Object.values(RESOLUCAO),
            placeholder: "Selecione o tipo de resolução.",
            nullOption: true,
          })}
        </Form.Select>
        TODO: AGENTE
      </StandardInput>
    </>
  );
}
