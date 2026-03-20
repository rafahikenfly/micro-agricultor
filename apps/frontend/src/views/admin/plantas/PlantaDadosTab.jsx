import { Form, } from "react-bootstrap";

import { handleSelectIdNome, renderOptions, StandardInput } from "../../../utils/formUtils";

import BaseTab from "../../../components/common/BaseTab";

export default function PlantaDadosTab({ form, setForm, estadosPlanta=[], loading}) {
  return (
    <>
      <BaseTab
        form={form}
        setForm={setForm}
      >
        <StandardInput
          label="Estado"
          info={estadosPlanta.find((est)=>est.id === form.estadoId)?.descricao}
          infoWidth="400px"
        >
          <Form.Select
            value={form.estadoId}
            onChange={e => handleSelectIdNome(e, {
              list: estadosPlanta,
              setForm: setForm,
              fieldId: "estadoId",
              nomeKey: "estadoNome",
            })}
          >
            {renderOptions({
              list: estadosPlanta,
              loading: loading,
              placeholder: "Selecione o estado da planta",
            })}
          </Form.Select>
        </StandardInput>
      </BaseTab>
    </>
  );
}
