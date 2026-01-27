import { Form, InputGroup } from "react-bootstrap";
import { renderOptions } from "../../utils/formUtils";

export default function ManejoDadosTab({ form, setForm, estados_canteiro, estados_planta, loading}) {
  return (
    <>
      <Form.Group>
        <Form.Label>Nome</Form.Label>
        <Form.Control
          value={form.nome}
          onChange={e => setForm({ ...form, nome: e.target.value })}
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
        <Form.Label>Tipo de Entidade</Form.Label>
        <Form.Select
          value={form.tipoEntidade}
          onChange={e => setForm({ ...form, tipoEntidade: e.target.value })}
        >
          <option value="Horta">Horta</option>
          <option value="Canteiro">Canteiro</option>
          <option value="Planta">Planta</option>
        </Form.Select>
      </Form.Group>

      <InputGroup >
        <Form.Label>Estado de Origem</Form.Label>
        <Form.Select
          disabled={(form.tipoEntidade) === "Horta"}
          value={form.estadoOrigemId}
          onChange={e => setForm({ ...form, estadoOrigemId: e.target.value})}
        >
          {renderOptions({
            list: 
              form.tipoEntidade === "Canteiro" ? estados_canteiro : 
              form.tipoEntidade === "Planta" ? estados_planta : 
              [],
            loading,
            placeholder: "Nenhum estado de origem",
            nullOption: true,
          })}
        </Form.Select>
        <Form.Label>Estado de Destino</Form.Label>
        <Form.Select
          disabled={(form.tipoEntidade) === "Horta"}
          value={form.estadoDestinoId}
          onChange={e => setForm({ ...form, estadoDestinoId: e.target.value})}
        >
          {renderOptions({
            list:
              form.tipoEntidade === "Canteiro" ? estados_canteiro :
              form.tipoEntidade === "Planta" ? estados_planta :
              [],
            loading,
            placeholder: "Nenhum estado de destino",
            nullOption: true,
          })}
        </Form.Select>
      </InputGroup>


      <Form.Check
        label="Requer Entrada"
        checked={form.requerEntrada}
        onChange={e =>
          setForm({ ...form, requerEntrada: e.target.checked })
        }
      />
    </>
  );
}
