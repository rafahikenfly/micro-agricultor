import { Form, } from "react-bootstrap";
import { RECORRENCIA, RECORRENCIA_FIM } from "micro-agricultor";

import { renderOptions, StandardCard, StandardInput } from "../../../utils/formUtils";
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
      <StandardCard header="Recorrência">

        <StandardInput label="Freqüência">
          <Form.Select
            value={formPlanejamento.recorrencia.tipoRecorrenciaId}
            onChange={(e)=> setFormPlanejamento({ ...formPlanejamento,
              recorrencia: {...formPlanejamento.recorrencia, tipoRecorrenciaId: e.target.value}
            })}
          >
            {renderOptions({
              list: Object.values(RECORRENCIA),
              placeholder: "Selecione a frequência",
            })}
          </Form.Select>
        </StandardInput>
        <StandardInput label="Tipo de Expiração">
          <Form.Select
            value={formPlanejamento.recorrencia.tipoRecorrenciaFim}
            onChange={(e)=> setFormPlanejamento({ ...formPlanejamento,
              recorrencia: {...formPlanejamento.recorrencia, tipoRecorrenciaFim: e.target.value}
            })}
          >
            {renderOptions({
              list: Object.values(RECORRENCIA_FIM),
              placeholder: "Selecione o tipo de expiração de recorrencia",
            })}
          </Form.Select>
        </StandardInput>
        <StandardInput label="Expira em">
          <Form.Control
            type="datetime-local"
            value={toDateTimeLocal(new Date(formPlanejamento.recorrencia.expiraEm))}
            onChange={(e)=> setFormPlanejamento({ ...formPlanejamento,
              recorrencia: {...formPlanejamento.recorrencia, expiraEm: new Date(e.target.value).getTime()}
            })}
          />
        </StandardInput>
        <StandardInput label="Expira após" unidade="execuções">
          <Form.Control
            type="number"
            value={formPlanejamento.recorrencia.expiraEm}
            onChange={(e)=> setFormPlanejamento({ ...formPlanejamento,
              recorrencia: {...formPlanejamento.recorrencia, expiraEm: e.target.value}
            })}
          />
        </StandardInput>
      </StandardCard>
    </>
  );
}
