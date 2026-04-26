import { Form } from "react-bootstrap";
import { ENTIDADE } from "micro-agricultor";
import { renderOptions, StandardCheckboxGroup, StandardInput } from "../../../utils/formUtils";
import BaseTab from "../../../components/common/BaseTab";
import { useCache } from "../../../hooks/useCache";

export default function ManejoDadosTab({ form, setForm }) {
  const { cacheEstadosPlanta, cacheEstadosCanteiro, cacheEstagiosEspecie, reading } = useCache([
    "estadosPlanta",
    "estadosCanteiro",
    "especies",
    "estagiosEspecie"
  ]);

  return (
    <BaseTab
      form={form}
      setForm={setForm}
    >
      <StandardCheckboxGroup label="Aplicável a">
        {Object.values(ENTIDADE).map(te => (
          <Form.Check
            key={te.id}
            label={te.nome}
            checked={form.aplicavel?.[te.id] === true ?? false}
            onChange={e => setForm({ ...form, aplicavel: { ...form.aplicavel, [te.id]: e.target.checked } })}
          />
        ))}
      </StandardCheckboxGroup>
      <StandardInput label="Estado de vida" width="180px">
        <Form.Select
          disabled={Object.keys(form.aplicavel || {}).length > 1 || form?.aplicavel.horta}
          value={form.estadoOrigemId}
          onChange={e => setForm({...form, estadoOrigemId: e.target.value})}
        >
          {renderOptions({
            list: form?.aplicavel.canteiro ? cacheEstadosCanteiro?.list :
                  form?.aplicavel.planta ? cacheEstadosPlanta?.list :
                  [],
            loading: reading,
            placeholder: "Nenhum estado de origem",
            nullOption: true,
          })}
        </Form.Select>
        <Form.Select
          disabled={Object.keys(form.aplicavel || {}).length > 1 || form?.aplicavel.horta}
          value={form.estadoDestinoId}
          onChange={e =>  setForm({...form, estadoDestinoId: e.target.value}) }
        >
          {renderOptions({
            list: form?.aplicavel.canteiro ? cacheEstadosCanteiro?.list :
                  form?.aplicavel.planta ? cacheEstadosPlanta?.list :
                  [],
            loading: reading,
            placeholder: "Nenhum estado de destino",
            nullOption: true,
          })}
        </Form.Select>
      </StandardInput>
      {form.aplicavel.planta && <StandardInput label="Estágio de espécie" width="180px">
        <Form.Select
          disabled={Object.keys(form.aplicavel || {}).length > 1 || form?.aplicavel.horta}
          value={form.estagioOrigemId}
          onChange={e => setForm({...form, estagioOrigemId: e.target.value})}
        >
          {renderOptions({
            list: cacheEstagiosEspecie?.list ?? [],
            loading: reading,
            placeholder: "Nenhum estágio de origem",
            nullOption: true,
          })}
        </Form.Select>
        <Form.Select
          disabled={Object.keys(form.aplicavel || {}).length > 1 || form?.aplicavel.horta}
          value={form.estagioDestinoId}
          onChange={e =>  setForm({...form, estagioDestinoId: e.target.value}) }
        >
          {renderOptions({
            list: cacheEstagiosEspecie?.list ?? [],
            loading: reading,
            placeholder: "Nenhum estágio de destino",
            nullOption: true,
          })}
        </Form.Select>
      </StandardInput>}
      <StandardCheckboxGroup label="Opções">
        <Form.Check
          label="Tem efeitos"
          checked={form.temEfeitos}
          onChange={e =>
            setForm({ ...form, temEfeitos: e.target.checked })
          }
        />
        <Form.Check
          label="Requer entradas"
          checked={form.temEntradas}
          onChange={e =>
            setForm({ ...form, temEntradas: e.target.checked })
          }
        />
      </StandardCheckboxGroup>
    </BaseTab>
  );
}