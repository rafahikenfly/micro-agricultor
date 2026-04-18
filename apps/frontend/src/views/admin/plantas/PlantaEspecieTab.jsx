import { useMemo } from "react";
import { Form } from "react-bootstrap";
import { mudarVariedade } from "micro-agricultor";

import { handleSelectIdNome, renderOptions, StandardCard, StandardInput } from "../../../utils/formUtils";
import { useCache } from "../../../hooks/useCache";
import Loading from "../../../components/Loading";

export function PlantaEspecieTab ({form, setForm }) {
  const {cacheEspecies, cacheVariedades, reading } = useCache(["especies", "variedades"])

  const variedadesDaEspecie = useMemo(() => {
    if (!form.especieId) return [];
    return (cacheVariedades?.list.filter(v => v.especieId === form.especieId) ?? []);
  }, [cacheVariedades, form.especieId]);
  const cicloDaEspecie = useMemo(() => {
    if (!form.especieId) return [];
    return (cacheEspecies?.list.find(e => e.id === form.especieId)?.ciclo ?? []);
  }, [cacheEspecies, form.especieId]);

  if (reading) return <Loading />
  if (!cacheEspecies || !cacheVariedades) return;


  return (
    <>
      <StandardCard header="Espécie">
        <StandardInput label="Espécie">
          <Form.Select
            value={form.especieId}
            onChange={e =>{
              handleSelectIdNome(e, {
                list: cacheEspecies.list,
                setForm,
                fieldId: "especieId",
                fieldNome: "especieNome",
              });
              setForm({...form, variedadeId: "", variedadeNome:"", estagioId: "", estagioNome: ""})
            }}
          >
            {renderOptions({
              list: cacheEspecies.list,
              loading: reading,
              placeholder: "Selecione a espécie da planta",
              isOptionDisabled: (esp) => !cacheVariedades.list.some((v) => v.especieId === esp.id),
            })}
          </Form.Select>
        </StandardInput>
        <StandardInput label="Variedade">
          <Form.Select
            value={form.variedadeId}
            onChange={e => setForm (mudarVariedade(form, cacheVariedades.list.find(i => i.id === e.target.value)))}
          >
            {renderOptions({
              list: variedadesDaEspecie,
              loading: reading,
              placeholder: "Selecione a variedade da planta",
            })}
        </Form.Select>
        </StandardInput>
        <StandardInput label="Estágio">
          <Form.Select
            value={form.estagioId}
            onChange={e => setForm({ ...form, estagioId: e.target.value })}
          >
            {renderOptions({
              list: cicloDaEspecie,
              loading: reading,
              valueKey: "estagioId",
              labelKey: "estagioNome",
              placeholder: "Selecione o estágio",
            })}
        </Form.Select>
        </StandardInput>

      </StandardCard>
    </>
  )
}
/**

const variedadesDaEspecie = variedades.filter((v) => v.especieId === e.target.value)
if (variedadesDaEspecie.length === 1) {
    setForm (mudarVariedade(form, variedadesDaEspecie[0]))
} else {
    setForm (prev => ({ ...prev,
variedadeId: "", variedadeNome: "",
estagioId: "", estagioNome: "",
}))
}
}}

*/