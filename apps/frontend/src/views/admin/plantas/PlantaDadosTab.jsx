import { Form, } from "react-bootstrap";

import { handleSelectIdNome, renderOptions, StandardInput } from "../../../utils/formUtils";

import BaseTab from "../../../components/common/BaseTab";
import { useCache } from "../../../hooks/useCache";

export default function PlantaDadosTab({ form, setForm }) {
  const { estadosPlanta, reading } = useCache(["estadosPlanta"]);

  return (
    <>
      <BaseTab
        form={form}
        setForm={setForm}
      >
        <StandardInput
          label="Estado"
          info={estadosPlanta?.map.get(form.estadoId)?.descricao}
          infoWidth="400px"
        >
          <Form.Select
            value={form.estadoId}
            onChange={e => handleSelectIdNome(e, {
              list: estadosPlanta.list,
              setForm: setForm,
              fieldId: "estadoId",
              nomeKey: "estadoNome",
            })}
          >
            {renderOptions({
              list: estadosPlanta?.list,
              loading: reading,
              placeholder: "Selecione o estado da planta",
            })}
          </Form.Select>
        </StandardInput>
      </BaseTab>
    </>
  );
}
