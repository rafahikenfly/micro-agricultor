import { Form, } from "react-bootstrap";
import { EVENTO, RESOLUCAO } from "micro-agricultor";

import { renderOptions, StandardInput } from "../../../utils/formUtils";
import { toDateTimeLocal } from "../../../utils/dateUtils";

export default function TarefaResolucaoTab({ formResolucao, setFormResolucao }) {
  if (!formResolucao) return <>Tarefa não resolvida</>
  return (
    <>
      <StandardInput label="Resolvido em">
        <Form.Control
          type="datetime-local"
          value={toDateTimeLocal(new Date(formResolucao.resolvidoEm))}
          onChange={(e) => setFormResolucao({  ...formResolucao, resolvidoEm: new Date(e.target.value).getTime()}) }
        />
      </StandardInput>
      <StandardInput label="Tipo de Resolução">
        <Form.Select
          value={formResolucao.tipoResolucaoId}
          onChange={(e)=> setFormResolucao({ ...formResolucao, tipoResolucaoId: e.target.value})}
        >
          {renderOptions({
            list: Object.values(RESOLUCAO),
            placeholder: "Selecione o tipo de resolução.",
            nullOption: true,
          })}
        </Form.Select>
      </StandardInput>
      <StandardInput label="Tipo de Evento">
        <Form.Select
          value={formResolucao.tipoEventoId}
          onChange={(e)=> setFormResolucao({ ...formResolucao, tipoEventoId: e.target.value})}
        >
          {renderOptions({
            list: Object.values(EVENTO),
            placeholder: "Selecione o tipo de evento de resolução.",
            nullOption: true,
          })}
        </Form.Select>
      </StandardInput>
      <div>TODO AGENTE</div>
    </>
  );
}
