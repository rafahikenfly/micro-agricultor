import { useMemo, } from "react";
import { Form } from "react-bootstrap";

import { handleSelectIdNome, renderOptions, StandardInput } from "../../../utils/formUtils";

import { EntidadeLocalizacaoTab } from "../../../components/common/EntidadePosDimTab";
import { useCache } from "../../../hooks/useCache";
import Loading from "../../../components/Loading";

export function PlantaLocalizacaoTab ({form, setForm, loading}) {
  const { cacheCanteiros, cacheHortas, reading } = useCache(["canteiros", "hortas"])


  const canteirosDaHorta = useMemo(() => {
    if (!form.hortaId) return [];
    return cacheCanteiros?.list.filter(c => c.hortaId === form.hortaId);
  }, [cacheCanteiros, form.hortaId]);

  if (reading) return <Loading />
  if (!cacheCanteiros || !cacheHortas) return;

  return (
      <EntidadeLocalizacaoTab
        form={form}
        setForm={setForm}
      >
        <StandardInput label="Pertence à horta:" width="35%">
          <Form.Select
            value={form.hortaId}
            onChange={e => {handleSelectIdNome(e, {
              list: cacheHortas.list,
              setForm: setForm,
              fieldId: "hortaId",
              nomeKey: "hortaNome",
            });
            setForm({...form, canteiroId: "", canteiroNome: ""})
          }}
          >
            {renderOptions({
              list: cacheHortas.list,
              loading: loading,
              placeholder: "Selecione a horta do canteiro",
            })}
          </Form.Select>
        </StandardInput>
        <StandardInput label="Pertence ao canteiro:" width="35%">
          <Form.Select
            value={form.hortaId}
            onChange={e => handleSelectIdNome(e, {
              list: canteirosDaHorta,
              setForm: setForm,
              fieldId: "canteiroId",
              nomeKey: "canteiroNome",
            })}
          >
            {renderOptions({
              list: canteirosDaHorta,
              loading: loading,
              placeholder: "Selecione o canteiro da planta",
            })}
          </Form.Select>
        </StandardInput>        
      </EntidadeLocalizacaoTab>
  )
}