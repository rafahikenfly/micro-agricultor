import { Form, } from "react-bootstrap";
import { alteraEspecieDaVariedade } from "micro-agricultor";

import { handleSelectWithRule, renderOptions, StandardCard, StandardInput } from "../../../utils/formUtils";

import BaseTab from "../../../components/common/BaseTab";
import VetorTab from "../../../components/common/VetorTab";

export default function VariedadeDadosTab({ form, setForm, especies, loading}) {
  return (
    <BaseTab
      form = {form}
      setForm = {setForm}
    >
      <StandardInput label="Espécie">
        <Form.Select
          value={form.especieId}
          onChange={e => handleSelectWithRule(e,{
            list: especies,
            setForm: setForm,
            regra: alteraEspecieDaVariedade,
            refEntityKey: "especie",
            targetEntityKey: "variedade",
          })}
        >
          {renderOptions({
            list: especies,
            loading,
            placeholder: "Selecione a espécie",
            isOptionDisabled: (a)=>(a?.ciclo || []).length === 0
          })}
        </Form.Select>
      </StandardInput>

      <StandardCard header="Espaçamento">
        <VetorTab formVetor={form.espacamento} setVetor={(espacamento) => setForm({ ...form, espacamento })} />
      </StandardCard>
    </BaseTab>
  );
}
