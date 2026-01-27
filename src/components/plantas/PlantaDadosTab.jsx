import { Form, } from "react-bootstrap";
import { handleSelectIdNome, renderOptions } from "../../utils/formUtils";
import { mudarVariedade } from "../../domain/planta.rules";

export default function PlantaDadosTab({ form, setForm, estadosPlantas = [], canteirosHorta = [], especies = [], variedades = [], loading}) {
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
        <Form.Label>Estado</Form.Label>
        <Form.Select
          value={form.estadoId}
          onChange={e =>
            handleSelectIdNome(e, {
              list: estadosPlantas,
              form,
              setForm,
              fieldId: "estadoId",
              fieldNome: "estadoNome",
            })}
        >
          {renderOptions({
            list: estadosPlantas,
            loading,
            placeholder: "Selecione o estado",
          })}
        </Form.Select>
      </Form.Group>

      <Form.Group>
        <Form.Label>Canteiro</Form.Label>
        <Form.Select
          value={form.canteiroId}
          onChange={e =>
            handleSelectIdNome(e, {
              list: canteirosHorta,
              form,
              setForm,
              fieldId: "canteiroId",
              fieldNome: "canteiroNome",
            })}
        >
          {renderOptions({
            list: canteirosHorta,
            loading,
            placeholder: "Selecione o canteiro",
          })}
        </Form.Select>
      </Form.Group>

      <Form.Group>
        <Form.Label>Espécie</Form.Label>
        <Form.Select
          value={form.especieId}
          onChange={e =>{
            handleSelectIdNome(e, {
              list: especies,
              form,
              setForm,
              fieldId: "especieId",
              fieldNome: "especieNome",
            })
            const variedadesDaEspecie = variedades.filter((v) => v.especieId === e.target.value)
            if (variedadesDaEspecie.length === 1) {
              setForm (mudarVariedade(form, variedadesDaEspecie[0]))
            }
          }}
        >
          {renderOptions({
            list: especies,
            loading,
            placeholder: "Selecione a espécie",
            isOptionDisabled: (esp) => !variedades.some((v) => v.especieId === esp.id),
          })}
        </Form.Select>
      </Form.Group>

      <Form.Group>
        <Form.Label>Variedade</Form.Label>
        <Form.Select
          value={form.variedadeId}
          onChange={e => setForm (mudarVariedade(form, variedades.find(i => i.id === e.target.value)))}
        >
          {renderOptions({
            list: variedades.filter( (v) => v.especieId === form.especieId),
            loading,
            placeholder: "Selecione a variedade",
          })}
        </Form.Select>
      </Form.Group>

    </>
  );
}
