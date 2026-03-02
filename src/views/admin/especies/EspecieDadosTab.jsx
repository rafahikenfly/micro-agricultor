import { Form } from "react-bootstrap";
import { handleSelectIdNome, renderOptions, StandardInput } from "../../../utils/formUtils";
import BaseTab from "../../../components/common/BaseTab";

export default function EspecieDadosTab({ form, setForm, categorias_especie = [], loading}) {
  return (
    <BaseTab
    form = {form}
    setForm = {setForm}>
      <StandardInput label="Nome Científico">
        <Form.Control
          value={form.nomeCientifico}
          onChange={e => setForm({ ...form, nomeCientifico: e.target.value })}
        />
      </StandardInput>
      <StandardInput
        label="Categoria"
        info={categorias_especie.find((cat)=>cat.id === form.categoriaId)?.descricao}
        infoWidth="400px"
      >

        <Form.Select
          value={form.categoriaId}
          onChange={e =>
            handleSelectIdNome(e, {
              list: categorias_especie,
              setForm,
              fieldId: "categoriaId",
              fieldNome: "categoriaNome",
            })}
        >
          {renderOptions({
            list: categorias_especie,
            loading,
            placeholder: "Selecione a categoria",
          })}
        </Form.Select>
      </StandardInput>
    </BaseTab>
  );
}
