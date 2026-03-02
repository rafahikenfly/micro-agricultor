import { Form } from "react-bootstrap";
import InputGroupText from "react-bootstrap/esm/InputGroupText";

import { handleSelectIdNome, renderOptions, StandardCard, StandardInput } from "../../../utils/formUtils";

export default function TarefaContextoTab({ formContexto, setFormContexto, caracteristicas, loading }) {
  return (
    <>
      <StandardCard header="Alvos">
        <StandardInput label="Array" stacked> {/*TODO: STANDARDINPUT PARA ENTRADA DE ARRAY*/}
          <Form.Control
            value={formContexto.alvos}
            onChange={(e)=>{setFormContexto({...formContexto, alvos: e.target.value})}}
          />
        </StandardInput>
      </StandardCard>
      <StandardCard header="Característica">
        <StandardInput label="Característica">
          <Form.Select
            value={formContexto.caracteristicaId}
            onChange={(e)=>handleSelectIdNome(e,{
                list: caracteristicas,
                setForm: setFormContexto,
                fieldId: "caracteristicaId",
                fieldNome: "caracteristicaNome",
            })}
          >
            {renderOptions({
                list: caracteristicas, //TODO: FILTER POR CARACTERISTICA APLICAVEL
                loading,
                placeholder: "Selecione a característica"
            })}
          </Form.Select>
        </StandardInput>
      </StandardCard>
      {formContexto.valorIdeal && <StandardCard>
        <StandardInput label="Valor">
          <InputGroupText>Mínimo</InputGroupText>
          <Form.Control
            type="number"
            step="0.01"
            value={formContexto.valorIdeal.min}
            onChange={(e)=>{setFormContexto({...formContexto, valorIdeal: {...formContexto.valorIdeal, min: Number(e.target.value)}})}}
          />
          <InputGroupText>Atual</InputGroupText>
          <Form.Control
            type="number"
            step="0.01"
            value={formContexto.valorAtual}
            onChange={(e)=>{setFormContexto({...formContexto, valorAtual: Number(e.target.value)})}}
          />
          <InputGroupText>Máximo</InputGroupText>
          <Form.Control
            type="number"
            step="0.01"
            value={formContexto.valorIdeal.min}
            onChange={(e)=>{setFormContexto({...formContexto, valorIdeal: {...formContexto.valorIdeal, min: Number(e.target.value)}})}}
          />
        </StandardInput>
      </StandardCard>}
      <StandardCard header="Observações">
        <StandardInput label="Observações">
            <Form.Control
              as="textarea"
              rows="3"
              value={formContexto.observacoes}
              onChange={(e)=>{setFormContexto({...formContexto, observaoces: e.target.value})}}
            />
        </StandardInput>
      </StandardCard>
    </>
  )
}