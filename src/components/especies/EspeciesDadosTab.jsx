import { Form, InputGroup } from "react-bootstrap";
import { handleSelectIdNome, renderOptions } from "../../utils/formUtils";

export default function EspecieDadosTab({ form, setForm, categorias_especie = [], loading}) {
  return (
    <Form className="p-3">
      <Form.Group>
        <Form.Label>Nome</Form.Label>
        <Form.Control
          value={form.nome}
          onChange={e => setForm({ ...form, nome: e.target.value })}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Nome Científico</Form.Label>
        <Form.Control
          as="textarea"
          value={form.nomeCientifico}
          onChange={e => setForm({ ...form, nomeCientifico: e.target.value })}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Descrição</Form.Label>
        <Form.Control
          as="textarea"
          value={form.descricao}
          onChange={e => setForm({ ...form, descricao: e.target.value })}
        />
      </Form.Group>

      <Form.Group>
        <Form.Label>Categoria</Form.Label>
        {}
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
      </Form.Group>
    </Form>
  );
}
