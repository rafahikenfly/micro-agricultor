import { Form } from "react-bootstrap";
import { renderOptions, StandardInput, StandardObjectInput } from "../../../utils/formUtils";
import { useState } from "react";
import { useCache } from "../../../hooks/useCache";

export default function CvModeloClassesTab({ formClasses, setFormClasses }) {
  const classes = formClasses?.classes ?? []
  const { cacheCaracteristicas, reading } = useCache(["caracteristicas"])
  const [form, setForm] = useState({
    classe: "",
    caracteristicaId: "",
  })

  return (
    <StandardObjectInput
      form={formClasses}
      setForm={setFormClasses}
      inputLabel="Nova classe"
      inputButtonLabel="Adicionar nova classe"
      inputKey={form.classe}
      inputData={form}
      colunas = {[
        { rotulo: "Classe", dataKey: "classe" },
        { rotulo: "Característica Mapeada", dataKey: "caracteristicaId", render: (a) => cacheCaracteristicas?.map.get(a.caracteristicaId)?.nome ?? "-" },
      ]}
    >
      <StandardInput label="Classe">
        <Form.Control
          value={form.classe}
          onChange={(e)=>{setForm({...form, classe: e.target.value})}}
        />
      </StandardInput>
      <StandardInput label="Característica">
        <Form.Select
          value={form.caracteristicaId}
          onChange={(e)=>setForm({...form, caracteristicaId: e.target.value})}
        >
          {renderOptions({
            list: cacheCaracteristicas?.list,
            loading: reading,
            placeholder: "Selecione a característica mapeada à classe"
          })}
        </Form.Select>
      </StandardInput>
    </StandardObjectInput>
  )
}