import { useMemo } from "react";
import { Form } from "react-bootstrap";
import { mudarVariedade } from "@domain/planta.rules";

import { handleSelectIdNome, renderOptions, StandardCard, StandardInput } from "../../../utils/formUtils";

export function PlantaEspecieTab ({form, setForm, variedades=[], especies=[], loading}) {


  const variedadesDaEspecie = useMemo(() => {
    if (!form.especieId) return [];
    return (variedades.filter(v => v.especieId === form.especieId) ?? []);
  }, [variedades, form.especieId]);

  const cicloDaEspecie = useMemo(() => {
    if (!form.especieId) return [];
    return (especies.find(e => e.id === form.especieId)?.ciclo ?? []);
  }, [especies, form.especieId]);

  return (
    <>
      <StandardCard header="Espécie">
        <StandardInput label="Espécie">
          <Form.Select
            value={form.especieId}
            onChange={e =>{
              handleSelectIdNome(e, {
                list: especies,
                setForm,
                fieldId: "especieId",
                fieldNome: "especieNome",
              });
              setForm({...form, variedadeId: "", variedadeNome:"", estagioId: "", estagioNome: ""})
            }}
          >
            {renderOptions({
              list: especies,
              loading,
              placeholder: "Selecione a espécie da planta",
              isOptionDisabled: (esp) => !variedades.some((v) => v.especieId === esp.id),
            })}
          </Form.Select>
        </StandardInput>
        <StandardInput label="Variedade">
          <Form.Select
            value={form.variedadeId}
            onChange={e => setForm (mudarVariedade(form, variedades.find(i => i.id === e.target.value)))}
          >
            {renderOptions({
              list: variedadesDaEspecie,
              loading,
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
              loading,
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