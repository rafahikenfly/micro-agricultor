import { Form } from "react-bootstrap";
import { REASON, } from "micro-agricultor";

import { handleSelectIdNome, renderOptions, StandardCard, StandardInput } from "../../../utils/formUtils";
import { useCache } from "../../../hooks/useCache";

export default function TarefaContextoTab({ formContexto, setFormContexto }) {
  const { cacheCaracteristicas, reading } = useCache(["caracteristicas"]);

  return (
    <>
      <StandardCard header="Entidades">
        <StandardInput label="Tipo de Entidade">
          TODO
        </StandardInput>
        <StandardInput label="Entidade" stacked> {/*TODO: STANDARDINPUT PARA ENTRADA DE ARRAY*/}
          <Form.Control
            value={formContexto.entidadesId}
            onChange={(e)=>{setFormContexto({...formContexto, entidadesId: e.target.value})}}
          />
        </StandardInput>
      </StandardCard>
      <StandardCard header="Característica">
        <StandardInput label="Característica">
          <Form.Select
            value={formContexto.caracteristicaId}
            onChange={(e)=>handleSelectIdNome(e,{
                list: cacheCaracteristicas?.list,
                setForm: setFormContexto,
                fieldId: "caracteristicaId",
                fieldNome: "caracteristicaNome",
            })}
          >
            {renderOptions({
                list: cacheCaracteristicas?.list, //TODO: FILTER POR CARACTERISTICA APLICAVEL
                loading: reading,
                placeholder: "Selecione a característica"
            })}
          </Form.Select>
        </StandardInput>
        <StandardInput label="Evento">

        </StandardInput>
        <StandardInput label="Motivo">
          <Form.Select
            value={formContexto.motivo}
            onChange={(e)=>setFormContexto({...formContexto, motivo: e.target.value})}
          >
            {renderOptions({
                list: Object.values(REASON),
                placeholder: "Selecione o motivo"
            })}
          </Form.Select>
        </StandardInput>
      </StandardCard>
    </>
  )
}