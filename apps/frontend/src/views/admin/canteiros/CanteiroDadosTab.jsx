import { Form, } from "react-bootstrap";
import BaseTab from "../../../components/common/BaseTab";
import { handleSelectIdNome, renderOptions, StandardInput } from "../../../utils/formUtils";

export default function CanteiroDadosTab({ form, setForm, estadosCanteiro, loading}) {
  return (
    <>
      <BaseTab
        form={form}
        setForm={setForm}
      >
        <StandardInput
          label="Estado"
          info={estadosCanteiro?.map.get(form.estadoId).descricao}
          infoWidth="400px"
        >
          <Form.Select
            value={form.estadoId}
            onChange={e => handleSelectIdNome(e, {
              list: estadosCanteiro?.list ?? [],
              setForm: setForm,
              fieldId: "estadoId",
              nomeKey: "estadoNome",
            })}
          >
            {renderOptions({
              list: estadosCanteiro?.list ?? [],
              loading,
              placeholder: "Selecione o estado do canteiro",
            })}
          </Form.Select>
        </StandardInput>
      </BaseTab>
    </>
  );
}
