import { Form, FormControl } from "react-bootstrap";
import BaseTab from "../common/BaseTab";
import ListaArray from "../common/ListaArray";

export default function CvModeloClassesTab({ form, setForm, }) {
  const formArray = form?.classes ?? []
  const arrayField = "classes"
  const onChangeField = (field, v) => { setForm({ ...form, [field]: v }); };
  const onChangeArr = (novoArr) => onChangeField(arrayField,novoArr)
  const onChangeArrElement = (idx, val) => {
    const novoArr = [...formArray];
    novoArr[idx] = val;
    onChangeArr(novoArr);
  };
  const onAddArrElement = () => { onChangeArr([...formArray, ""]); };
  const onRemoveArrElement = (idx) => {
    const novoArr = formArray.filter((_, i) => i !== idx);
    onChangeArr(novoArr);
  };
  return (
    <ListaArray
        dados={formArray}
        colunas={[
          {rotulo: "Classe", render: (item, idx) => <Form.Control
            size="sm"
            value={item}
            onChange={e => onChangeArrElement(idx, e.target.value)}
          />}
        ]}
        onAdd={onAddArrElement}
        addLabel="Adicionar Classe"
        onRemove={onRemoveArrElement}
        showIndex
    />
  )
}