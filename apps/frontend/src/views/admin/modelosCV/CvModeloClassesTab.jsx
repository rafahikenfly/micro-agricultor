import { Form } from "react-bootstrap";
import { StandardArrayInput } from "../../../utils/formUtils";

export default function CvModeloClassesTab({ formClasses, setFormClasses, }) {
  const classes = formClasses?.classes ?? []
  const setClasses = (novoArr) => setFormClasses({...formClasses, classes: novoArr})
  const onChangeClasse = (idx, val) => {
    const novoArr = [...classes];
    novoArr[idx] = val;
    setClasses(novoArr);
  };

  return (
    <StandardArrayInput
      form={formClasses}
      setForm={setFormClasses}
      inputLabel="Nova classe"
      inputButtonLabel="Adicionar nova classe"
      inputData={{ id: "" }}
      colunas = {[
        {rotulo: "Id", render: (item, idx) => <Form.Control
          size="sm"
          value={item.id}
          onChange={e => onChangeClasse(idx, "id", e.target.value)}
        />},
      ]}
    />
  )
}