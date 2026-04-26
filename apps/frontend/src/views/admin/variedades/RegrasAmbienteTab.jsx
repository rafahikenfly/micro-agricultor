import { useState } from "react";
import { Form } from "react-bootstrap";

import { renderOptions, StandardObjectInput, StandardInput } from "../../../utils/formUtils";
import { useCache } from "../../../hooks/useCache";

export default function RegrasAmbienteTab({ formAmbiente = {}, setFormAmbiente, header = "Condições ambientais neste estágio" }) {
  if (!formAmbiente) return null;

  const { cacheCaracteristicas, reading } = useCache(["caracteristicas"]);

  const [formRegra, setFormRegra] = useState({
    caracteristicaId: "",
    min: 0,
    max: 0,
  });

  return (
    <StandardObjectInput
      form={formAmbiente}
      setForm={setFormAmbiente}
      inputLabel={header}
      inputData={formRegra}
      inputKey={formRegra.caracteristicaId}
      inputField="caracteristicaId"
      colunas={[
        { rotulo: "Característica", dataKey: "caracteristicaId", render: (a)=>cacheCaracteristicas?.map.get(a.caracteristicaId)?.nome ?? "-" },
        { rotulo: "Mínimo", dataKey: "min" },
        { rotulo: "Máximo", dataKey: "max" }
      ]}
      acoes={[]}
    >
      <StandardInput label = "Característica" width={"180px"}>

        <Form.Select
          value={formRegra.caracteristicaId}
          onChange={(e) => setFormRegra({...formRegra, caracteristicaId: e.target.value})}
        >
          {renderOptions({
            list: cacheCaracteristicas?.list.filter((a) => a.aplicavel.canteiro),
            placeholder: "Selecione a característica",
            loading: reading,
          })}
        </Form.Select>
      </StandardInput>
      <StandardInput
        label="Faixa ideal (Mín/Máx)"
        width={"180px"}
        unidade={cacheCaracteristicas?.map.get(formRegra.caracteristicaId)?.medida.unidade ?? "-"}
      >
        <Form.Control
          type="number"
          value={formRegra.min}
          onChange={(e) => setFormRegra({ ...formRegra, min: Number(e.target.value) })}
        />
        <Form.Control
          type="number"
          value={formRegra.max}
          onChange={(e) => setFormRegra({ ...formRegra, max: Number(e.target.value) })}
        />
      </StandardInput>
    </StandardObjectInput>
  );
}