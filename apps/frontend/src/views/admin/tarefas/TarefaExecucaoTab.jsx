import { Form, } from "react-bootstrap";

import { StandardInput } from "../../../utils/formUtils";
import { toDateTimeLocal } from "../../../utils/dateUtils";

export default function TarefaExecucaoTab({ formExecucao, setFormExecucao }) {
  if (!formExecucao) return <>Tarefa não iniciada</>
  return (
    <>
      <StandardInput label="Adquirida em">
        <Form.Control
          type="datetime-local"
          value={toDateTimeLocal(new Date(formExecucao.adquiridaEm))}
          onChange={(e)=> setFormExecucao({ ...formExecucao, adquiridaEm: new Date(e.target.value).getTime()})}
        />
      </StandardInput>
      <StandardInput label="Adquirida até">
        <Form.Control
          type="datetime-local"
          value={toDateTimeLocal(new Date(formExecucao.adquiridaAte))}
          onChange={(e)=> setFormExecucao({ ...formExecucao, adquiridaAte: new Date(e.target.value).getTime()})}
        />
      </StandardInput>
      <StandardInput label="Inicado em">
        <Form.Control
          type="datetime-local"
          value={toDateTimeLocal(new Date(formExecucao.iniciadoEm))}
          onChange={(e)=> setFormExecucao({ ...formExecucao, iniciadoEm: new Date(e.target.value).getTime()})}
        />
      </StandardInput>
      <StandardInput label="Finalizado em">
        <Form.Control
          type="datetime-local"
          value={toDateTimeLocal(new Date(formExecucao.finalizadoEm))}
          onChange={(e)=> setFormExecucao({ ...formExecucao, finalizadoEm: new Date(e.target.value).getTime()})}
        />
      </StandardInput>
      <StandardInput label="Tentativas" unidade="execuções">
        <Form.Control
          type="number"
          value={formExecucao.tentativas}
          onChange={(e)=> setFormExecucao({ ...formExecucao, tentativas: e.target.value })}
        />
      </StandardInput>
      <StandardInput label="Máximo de tentativas" unidade="execuções">
        <Form.Control
          type="number"
          value={formExecucao.maxTentativas}
          onChange={(e)=> setFormExecucao({ ...formExecucao, maxTentativas: e.target.value })}
        />
      </StandardInput>
      <div>TODO AGENTE</div>
    </>
  );
}
