import { Form } from "react-bootstrap";
import { ENTIDADE } from "micro-agricultor";

import { renderOptions, StandardArrayInput, StandardCard, StandardInput } from "../../../utils/formUtils";
import { useCache } from "../../../hooks/useCache";
import { useState } from "react";

export default function TarefaContextoTab({ formContexto, setFormContexto }) {
  const { cacheCaracteristicas, cacheCanteiros, cachePlantas, reading } = useCache([
    "caracteristicas",
    "canteiros",
    "plantas"
  ]);
  const [novaEntidadeId, setNovaEntidadeId] = useState("");

  const cachesEntidade = {
    [ENTIDADE.canteiro.id]: cacheCanteiros,
    [ENTIDADE.planta.id]: cachePlantas,
  }
  return (
    <>
      <StandardCard header="Entidades">
        <StandardInput label="Tipo de Entidade">
          <Form.Select
            value={formContexto.tipoEntidadeId}
            onChange={e => setFormContexto({...formContexto, tipoEntidadeId: e.target.value})}
          >
            {renderOptions({
              list: Object.values(ENTIDADE),
              placeholder: "Selecione o tipo de entidade vinculado à tarefa",
            })}
          </Form.Select>
        </StandardInput>
        <StandardArrayInput 
          form = {formContexto.entidadesId}
          setForm = {(entidadesId)=>setFormContexto({...formContexto, entidadesId})}
          header = "Entidades vinculadas"
          headerData = {novaEntidadeId}
          colunas = {[
            {rotulo: "Id da Entidade", datakey: "a", render: (a)=>a},
            {rotulo: "Nome da Entidade", datakey: "a", render: (a)=>cachesEntidade[formContexto.tipoEntidadeId]?.map.get(a)?.nome ?? `[Não é ${formContexto.tipoEntidadeId}]`}
          ]}
        >
          <Form.Select
            value={novaEntidadeId}
            onChange={(e)=>setNovaEntidadeId(e.target.value)}
          >
            {renderOptions({
              list: cachesEntidade[formContexto.tipoEntidadeId]?.list,
              loading: reading,
              placeholder: "Selecione a entidade",
            })}
          </Form.Select>
        </StandardArrayInput>
      </StandardCard>
      <StandardCard header="Característica">
        <StandardInput label="Característica">
          <Form.Select
            value={formContexto.caracteristicaId}
            onChange={(e)=>setFormContexto({...formContexto, caracteristicaId: e.target.value})}
          >
            {renderOptions({
                list: cacheCaracteristicas?.list.filter((a)=>a.aplicavel[formContexto.tipoEntidadeId]),
                loading: reading,
                placeholder: "Selecione a característica"
            })}
          </Form.Select>
        </StandardInput>
      </StandardCard>
    </>
  )
}