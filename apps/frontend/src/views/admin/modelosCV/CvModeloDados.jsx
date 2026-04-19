import BaseTab from "../../../components/common/BaseTab";
import { StandardInput } from "../../../utils/formUtils";

export default function CvModeloDadosTab({ form, setForm,}) {
  return (
    <BaseTab
    form = {form}
    setForm = {setForm}
    >
      <StandardInput label="Ativo">

      </StandardInput>
    </BaseTab>
  )
}