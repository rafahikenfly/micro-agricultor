import { Form } from "react-bootstrap";
import { ENTIDADE } from "micro-agricultor";
import { handleSelectIdNome, renderOptions, StandardCheckboxGroup, StandardInput } from "../../../utils/formUtils";
import BaseTab from "../../../components/common/BaseTab";

export default function ManejoDadosTab({ form, setForm, estados_canteiro, estados_planta, loading}) {
  return (
    <BaseTab
      form={form}
      setForm={setForm}
    >
      <StandardCheckboxGroup label="Aplicável a">
        {Object.values(ENTIDADE).map(te => (
          <Form.Check
            key={te.id}
            label={te.nome}
            checked={form.aplicavel?.[te.id] === true ?? false}
            onChange={e => setForm({ ...form, aplicavel: { ...form.aplicavel, [te.id]: e.target.checked } })}
          />
        ))}
      </StandardCheckboxGroup>
      <StandardInput label="Estado">
        <Form.Select
          disabled={Object.keys(form.aplicavel || {}).length > 1 || form?.aplicavel.horta}
          value={form.estadoOrigemId}
          onChange={e => handleSelectIdNome(e,{
            list: form?.aplicavel.canteiro ? estados_canteiro :
                  form?.aplicavel.planta ? estados_planta :
                  [],
            setForm: setForm,
            fieldId: "estadoOrigemId",
            fieldNome: "estadoOrigemNome",
          })}
        >
          {renderOptions({
            list: form?.aplicavel.canteiro ? estados_canteiro :
                  form?.aplicavel.planta ? estados_planta :
                  [],
            loading,
            placeholder: "Nenhum estado de origem",
            nullOption: true,
          })}
        </Form.Select>
        <Form.Select
          disabled={Object.keys(form.aplicavel || {}).length > 1 || form?.aplicavel.horta}
          value={form.estadoDestinoId}
          onChange={e => handleSelectIdNome(e,{
            list: form?.aplicavel.canteiro ? estados_canteiro :
                  form?.aplicavel.planta ? estados_planta :
                  [],
            setForm: setForm,
            fieldId: "estadoDestinoId",
            fieldNome: "estadoDestinoNome",
          })}
        >
          {renderOptions({
            list: form?.aplicavel.canteiro ? estados_canteiro :
                  form?.aplicavel.planta ? estados_planta :
                  [],
            loading,
            placeholder: "Nenhum estado de destino",
            nullOption: true,
          })}
        </Form.Select>
      </StandardInput>
      <StandardCheckboxGroup label="Opções">
        <Form.Check
          label="Tem efeitos"
          checked={form.temEfeitos}
          onChange={e =>
            setForm({ ...form, temEfeitos: e.target.checked })
          }
        />
        <Form.Check
          label="Requer entradas"
          checked={form.temEntradas}
          onChange={e =>
            setForm({ ...form, temEntradas: e.target.checked })
          }
        />
      </StandardCheckboxGroup>
    </BaseTab>
  );
}