import { ACUMULACAO } from "micro-agricultor";
import { renderOptions, StandardCard, StandardInput } from "../../../utils/formUtils"
import { Form } from "react-bootstrap";

export default function CaracteristicaSensor ({form, setForm}) {
  const acumulacao = form.acumulacao;
  const setAcumulacao = (value, key) =>
    setForm({
      ...form,
      acumulacao: {
        ...form.acumulacao,
        [key]: value
      }
    })

  return ( <>
    <StandardCard header="Acumulação">
      <StandardInput label="Tipo de Acumulação">
        <Form.Select
          value = {acumulacao.tipoAcumulacaoId}
          onChange={(e)=> setAcumulacao(e.target.value, "tipoAcumulacaoId")}
        >
          {renderOptions({
              list: Object.values(ACUMULACAO),
              placeholder: "Selecione o tipo de acumulação da característica"
          })}
        </Form.Select>
      </StandardInput>
      <StandardInput
        label="Tempo de acumulação"
        unidade="minutos"
      >
      <Form.Control
            type="number"
            value={acumulacao.tempo/60000}
            onChange={e => setAcumulacao(Number(e.target.value)*60000, "tempo")}
      />
      </StandardInput>
      <StandardInput label="Limite para acumulador">
        <Form.Control
          type="number"
          value={acumulacao.limite}
          onChange={(e)=> setAcumulacao(Number(e.target.value), "limite")}
        />
      </StandardInput>
    </StandardCard>
  </>)
}