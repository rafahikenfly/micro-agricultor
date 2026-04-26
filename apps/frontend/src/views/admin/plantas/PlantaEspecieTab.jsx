import { useMemo } from "react";
import { Form } from "react-bootstrap";
import { mudarVariedade } from "micro-agricultor";

import { handleSelectIdNome, optionsFromCacheList, renderOptions, StandardCard, StandardInput } from "../../../utils/formUtils";
import { useCache } from "../../../hooks/useCache";
import Loading from "../../../components/Loading";

export function PlantaEspecieTab ({form, setForm }) {
  const {cacheEspecies, cacheVariedades, cacheEstagiosEspecie, reading } = useCache([
    "especies",
    "variedades",
    "estagiosEspecie"
  ])

  // ==== Monta opções ====
  const optionsVariedade = useMemo(() => {
    // Lista vazia
    if (!form.especieId) return [];

    // Obtem a lista
    const variedades = (cacheVariedades?.list.filter(v => v.especieId === form.especieId));
    if (!variedades) return [];

    // Monta as opções
    return variedades

  }, [cacheVariedades, form.especieId]);
  const optionsEstagio = useMemo(() => {
    // Lista Vazia
    if (!form.especieId) return [];

    // Obtem o cache
    const ciclo = cacheEspecies?.map.get(form.especieId)?.ciclo;
    if (!ciclo) return [];

    // Monta as opções
    return optionsFromCacheList({
      sourceList: ciclo,
      cacheMap: cacheEstagiosEspecie?.map,
      getId: (fase) => fase.estagioId,
    });
  }, [cacheEspecies, cacheEstagiosEspecie, form.especieId]);

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
              list: optionsVariedade,
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
              list: optionsEstagio,
              loading: reading,
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