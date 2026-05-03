import { Form, FormSelect } from "react-bootstrap";
import BaseTab from "../../../components/common/BaseTab";
import { renderOptions, StandardCard, StandardCheckboxGroup, StandardInput } from "../../../utils/formUtils";
import { ENTIDADE } from "micro-agricultor";

export default function CvModeloDadosTab({ form, setForm,}) {
  return (
    <BaseTab
    form = {form}
    setForm = {setForm}
    >
      <StandardCheckboxGroup label="Opções">
        <Form.Check
          label="Ativo"
          checked={form.ativo}
          onChange={(e)=>{setForm({...form, ativo: e.target.checked})}}
        />        
      </StandardCheckboxGroup>
      <StandardInput label="Caminho">
        <Form.Control
          value={form.path}
          onChange={(e)=>setForm({...form, path: e.target.value})}
        />
      </StandardInput>
      <StandardCard
        header="Especialidade"
        headerRight={
          <Form.Check
            label="Especialista"
            checked={form.especialista}
            onChange={(e)=>{setForm({...form, especialista: e.target.checked})}}
          />
        }
      >
        <StandardInput label="Tipo de Entidade">
          <FormSelect
            value={form.tipoEntidadeId}
            onChange={(e)=>setForm({...form, tipoEntidadeId: e.target.value})}
          >
            {renderOptions({
              list: Object.values(ENTIDADE),
              placeholder: "Selecione o tipo de entidade do modelo",
            })}
          </FormSelect>
        </StandardInput>

        <StandardInput label="Chave">
          <Form.Control
            value={form.especialidadeKey}
            disabled={!form.especialista}
            onChange={(e)=>setForm({...form, especialidadeKey: e.target.value})}
          />
        </StandardInput>
        <StandardInput label="Valor">
          <Form.Control
            value={form.especialidadeValue}
            disabled={!form.especialista}
            onChange={(e)=>setForm({...form, especialidadeValue: e.target.value})}
          />
        </StandardInput>
      </StandardCard>
    </BaseTab>
  )
}