import { useMemo, } from "react";
import { Form } from "react-bootstrap";

import { handleSelectIdNome, renderOptions, StandardInput } from "../../../utils/formUtils";

import { EntidadeLocalizacaoTab } from "../../../components/common/EntidadePosDimTab";

export function PlantaLocalizacaoTab ({form, setForm, hortas=[], listaCanteiros=[], loading}) {

  const canteirosDaHorta = useMemo(() => {
    if (!form.hortaId) return [];
    return listaCanteiros.filter(c => c.hortaId === form.hortaId);
  }, [listaCanteiros, form.hortaId]);

  return (
      <EntidadeLocalizacaoTab
        form={form}
        setForm={setForm}
      >
        <StandardInput label="Pertence à horta:" width="35%">
          <Form.Select
            value={form.hortaId}
            onChange={e => {handleSelectIdNome(e, {
              list: hortas,
              setForm: setForm,
              fieldId: "hortaId",
              nomeKey: "hortaNome",
            });
            setForm({...form, canteiroId: "", canteiroNome: ""})
          }}
          >
            {renderOptions({
              list: hortas,
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