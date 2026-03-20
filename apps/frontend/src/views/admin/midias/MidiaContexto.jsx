import { Form, FormControl } from "react-bootstrap"
import { ENTIDADE } from "micro-agricultor"
import { renderOptions, StandardCard, StandardInput } from "../../../utils/formUtils"
import { useState } from "react";
import { toDateTimeLocal } from "../../../utils/dateUtils";
import { timestamp } from "../../../firebase";

export const MidiaContextoTab = ({formContexto, setFormContexto, loading, catalogoPlantas, catalogoCanteiros}) => {
  const MAPA_CATALOGOS = {
    planta: catalogoPlantas,
    canteiro: catalogoCanteiros,
  }

  return (
    <>
    <StandardCard header="Horta">
      <StandardInput label = "HortaId">
        TODO: SELECTBOX
        <Form.Control
          value={formContexto.hortaId}
          onChange={(e)=>setFormContexto({...formContexto, hortaId: e.target.value})}
        />
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
            list: MAPA_CATALOGOS[formContexto.tipoEntidadeId].list,
            placeholder: "Selecione a entidade",
            loading,
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