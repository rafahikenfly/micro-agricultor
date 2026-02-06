import { Form, } from "react-bootstrap";
import { handleSelectIdNome, renderOptions } from "../../utils/formUtils";
import { mudarVariedade } from "../../domain/planta.rules";

export default function PlantaDadosTab({
  form,
  setForm,
  estados_planta=[],
  estagios_especie=[],
  canteiros=[],
  especies=[],
  variedades = [],
  loading}) {

  // TODO: filtrar os estágios pela espécie selecionada (ou pelo menos indicar quais são compatíveis)

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
          rows={3}
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
              list: estados_planta,
              setForm,
              fieldId: "estadoId",
              fieldNome: "estadoNome",
            })}
        >
          {renderOptions({
            list: estados_planta,
            loading,
            placeholder: "Selecione o estado",
          })}
        </Form.Select>
      </Form.Group>

      <Form.Group>
        <Form.Label>Canteiro</Form.Label>
        <Form.Select
          value={form.canteiroId}
          onChange={e =>{
            handleSelectIdNome(e, {
              list: canteiros,
              setForm,
              fieldId: "canteiroId",
              fieldNome: "canteiroNome",
            });
            handleSelectIdNome(e, {
              list: canteiros,
              setForm,
              idKey: "hortaId",
              nameKey: "hortaNome",
              fieldId: "hortaId",
              fieldNome: "hortaNome",
            });
            }}
        >
          {renderOptions({
            list: canteiros,
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
              setForm,
              fieldId: "especieId",
              fieldNome: "especieNome",
            })
            const variedadesDaEspecie = variedades.filter((v) => v.especieId === e.target.value)
            if (variedadesDaEspecie.length === 1) {
              setForm (mudarVariedade(form, variedadesDaEspecie[0]))
            } else {
              setForm (prev => ({ ...prev,
                variedadeId: "", variedadeNome: "",
                estagioId: "", estagioNome: "",
              }))
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

      <Form.Group>
        <Form.Label>Estagio</Form.Label>
        <Form.Select
          value={form.estagioId}
          onChange={e => setForm({ ...form, estagioId: e.target.value })}
        >
          {renderOptions({
            list: especies.find(e => e.id === form.especieId)?.ciclo || [],
            loading,
            valueKey: "estagioId",
            labelKey: "estagioNome",
            placeholder: "Selecione o estágio",
          })}
        </Form.Select>
      </Form.Group>
    </>
  );
}
