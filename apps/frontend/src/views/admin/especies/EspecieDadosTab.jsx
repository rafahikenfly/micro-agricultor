import { Form } from "react-bootstrap";
import { handleSelectIdNome, renderOptions, StandardInput } from "../../../utils/formUtils";
import BaseTab from "../../../components/common/BaseTab";
import { useCache } from "../../../hooks/useCache";

export default function EspecieDadosTab({ form, setForm, categorias_especie = [], loading}) {

  const { cacheCategoriasEspecie, reading } = useCache([
    "categoriasEspecie",
  ]);
  
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
              list: cacheCategoriasEspecie?.list,
              setForm,
              fieldId: "categoriaId",
              fieldNome: "categoriaNome",
            })}
        >
          {renderOptions({
            list: cacheCategoriasEspecie?.list,
            loading: reading,
            placeholder: "Selecione a categoria",
          })}
        </Form.Select>
      </StandardInput>
    </BaseTab>
  );
}
