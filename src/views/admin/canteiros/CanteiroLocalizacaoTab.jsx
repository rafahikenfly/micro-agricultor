import { Form } from "react-bootstrap";
import { handleSelectIdNome, renderOptions, StandardInput } from "../../../utils/formUtils";
import { EntidadeLocalizacaoTab } from "../../../components/common/EntidadePosDimTab";

export function CanteiroLocalizacaoTab ({form, setForm, hortas, loading}) {
  return (
      <EntidadeLocalizacaoTab
        form={form}
        setForm={setForm}
      >
        <StandardInput label="Pertence à horta:" width="35%">
          <Form.Select
            value={form.hortaId}
            onChange={e => handleSelectIdNome(e, {
              list: hortas,
              setForm: setForm,
              fieldId: "hortaId",
              nomeKey: "hortaNome",
            })}
          >
            {renderOptions({
              list: hortas,
              loading: loading,
              placeholder: "Selecione a horta do canteiro",
            })}
          </Form.Select>
        </StandardInput>
      </EntidadeLocalizacaoTab>
  )
}