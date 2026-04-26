import { useState } from "react";
import { Form, Badge } from "react-bootstrap";
import { renderOptions, StandardArrayInput, StandardCheckboxGroup, StandardInput } from "../../../utils/formUtils";
import { useCache } from "../../../hooks/useCache";
import { VARIANTE } from "micro-agricultor";

export default function EspecieCicloTab({ formCiclo, setFormCiclo, }) {
  const { cacheEstagiosEspecie, reading } = useCache([
    "estagiosEspecie",
  ]);

  const [form, setForm] = useState({
    estagioId: "",
    plantavel: false,
    colhivel: false,
    instrucoes: ""
  })

  const duplicarEstagio = (data, idx) => {
    setForm({
      ...data,
      estagio: cacheEstagiosEspecie?.map.get(data.estagioId),
    })
  }

  const inputButtonIsDisabled = ()=>{
    console.log("dis")
    return form.estagioId === "";
  }
  return (
    <StandardArrayInput
      form = {formCiclo}
      setForm={setFormCiclo}
      inputLabel = "Incluir estágio no ciclo da espécie"
      inputButtonLabel = "Incluir"
      inputData = {form}
      inputButtonIsDisabled = {form.estagioId === ""}
      colunas={[
        {rotulo: "Estágio", dataKey: "estagioId", render: (a)=> cacheEstagiosEspecie?.map.get(a.estagioId)?.nome ?? "-"},
        {rotulo: "Plantável?", dataKey: "plantavel", render: (a)=> <Badge bg={a.plantavel ? VARIANTE.LIGHTBLUE.variant.id : VARIANTE.RED.variant.id}>{a.plantavel ? "Sim" : "Não"}</Badge>},
        {rotulo: "Colhível?", dataKey: "colhivel", render: (a)=> <Badge bg={a.colhivel ? VARIANTE.LIGHTBLUE.variant.id : VARIANTE.RED.variant.id}>{a.colhivel ? "Sim" : "Não"}</Badge>},
        {rotulo: "Instruções", dataKey: "instrucoes"},
      ]}
      acoes={[
        {rotulo: "⧉", funcao: duplicarEstagio, variant: VARIANTE.GREEN.variant.id},
      ]}
    >
      <StandardInput label="Inserir estágio">
        <Form.Select
          value={form.estagioId ?? ""}
          onChange={e => setForm({...form, estagioId: e.target.value})}
        >
        {renderOptions({
          list: cacheEstagiosEspecie?.list,
          loading: reading,
          placeholder: "Selecione o estágio",
        })}
        </Form.Select>
      </StandardInput>
      <StandardInput label="Instruções">
        <Form.Control
          as="textarea"
          rows={3}
          value={form.instrucoes}
          onChange={(e) => setForm({...form, instrucoes: e.target.value})}
        />
      </StandardInput>
      <StandardCheckboxGroup label="Propriedades">
        <Form.Check 
          checked={form.plantavel}
          label="Plantável"
          onChange={e => setForm({...form, plantavel: e.target.checked})}
        />
        <Form.Check 
          checked={form.colhivel}
          label="Colhível"
          onChange={e => setForm({...form, colhivel: e.target.checked})}
        />
      </StandardCheckboxGroup>
    </StandardArrayInput>
  );
}
