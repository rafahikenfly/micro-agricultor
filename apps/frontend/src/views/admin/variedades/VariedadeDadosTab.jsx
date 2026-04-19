import { Form, } from "react-bootstrap";
import { alteraEspecieDaVariedade } from "micro-agricultor";

import { handleSelectWithRule, renderOptions, StandardCard, StandardInput } from "../../../utils/formUtils";

import BaseTab from "../../../components/common/BaseTab";
import VetorTab from "../../../components/common/VetorTab";
import { useCache } from "../../../hooks/useCache";

export default function VariedadeDadosTab({ form, setForm }) {
  const { cacheEspecies, reading } = useCache([
    "especies",
  ]);

  return (
    <BaseTab
      form = {form}
      setForm = {setForm}
    >
      <StandardInput label="Espécie">
        <Form.Select
          value={form.especieId}
          onChange={e => handleSelectWithRule(e,{
            list: cacheEspecies?.list,
            setForm: setForm,
            regra: alteraEspecieDaVariedade,
            refEntityKey: "especie",
            targetEntityKey: "variedade",
          })}
        >
          {renderOptions({
            list: cacheEspecies?.list,
            loading: reading,
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
