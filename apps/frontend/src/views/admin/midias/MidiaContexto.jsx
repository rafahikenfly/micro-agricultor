import { Form } from "react-bootstrap"
import { ENTIDADE } from "micro-agricultor"
import { renderOptions, StandardCard, StandardInput } from "../../../utils/formUtils"
import { toDateTimeLocal } from "../../../utils/dateUtils";
import { useCache } from "../../../hooks/useCache";
import Loading from "../../../components/Loading";

export const MidiaContextoTab = ({formContexto, setFormContexto }) => {
  const { cachePlantas, cacheCanteiros, cacheHortas, reading } = useCache([
    "plantas",
    "canteiros",
    "hortas",
  ]);

  if (reading) return <Loading />

  const MAPA_CATALOGOS = {
    [ENTIDADE.planta.id]: cachePlantas?.list,
    [ENTIDADE.canteiro.id]: cacheCanteiros?.list,
  }

  return (
    <>
    <StandardCard header="Horta">
      <StandardInput label = "HortaId">
        <Form.Select
          value={formContexto.entidadeId}
          onChange={e => setFormContexto({...formContexto, hortaId: e.target.value})}
        >
          {renderOptions({
            list: cacheHortas?.list,
            placeholder: "Selecione a horta",
            loading: reading,
          })}
        </Form.Select>
      </StandardInput>
    </StandardCard>
    <StandardCard header="Contexto">
      <StandardInput label="Tipo de Entidade">
        <Form.Select
          value={formContexto.tipoEntidadeId}
          onChange={e => setFormContexto({...formContexto, tipoEntidadeId: e.target.value})}
          >
          {renderOptions({
            list: Object.values(ENTIDADE),
            placeholder: "Selecione o tipo de entidade",
            isOptionDisabled:  (a) => !Object.keys(MAPA_CATALOGOS).includes(a.id)
          })}
        </Form.Select>
      </StandardInput>

      <StandardInput label = "EntidadeId">
        <Form.Select
          value={formContexto.entidadeId}
          onChange={e => setFormContexto({...formContexto, entidadeId: e.target.value})}
        >
          {renderOptions({
            list: MAPA_CATALOGOS[formContexto.tipoEntidadeId],
            placeholder: "Selecione a entidade",
            loading: reading,
          })}
        </Form.Select>
      </StandardInput>
    </StandardCard>
    <StandardCard header="Data/hora">
      <StandardInput label="Data/hora" width="120px">
        <Form.Control
          type="datetime-local"
          value={toDateTimeLocal(new Date(formContexto.timestamp))}
          onChange={(e)=> setFormContexto({...formContexto, timestamp:new Date(e.target.value).getTime()})}
        />
      </StandardInput>
    </StandardCard>
    </>
  )
}