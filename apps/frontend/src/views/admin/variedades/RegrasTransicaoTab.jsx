import { useState } from "react";
import { Form } from "react-bootstrap";

import { renderOptions, StandardInput, StandardObjectInput } from "../../../utils/formUtils";
import { useCache } from "../../../hooks/useCache";
import { OPERADOR } from "micro-agricultor/types/OPERADOR";

export default function RegrasTransicaoTab({ formTransicao, setFormTransicao }) {
  if (!formTransicao) return null;

  const { cacheCaracteristicas, reading } = useCache(["caracteristicas"])

  const [formRegra, setFormRegra] = useState({
    caracteristicaId: "",
    operador: "",
    limite: 0,
  });

  return (
    <StandardObjectInput
      form={formTransicao}
      setForm={setFormTransicao}
      inputLabel="Transição para este estado depende de:"
      inputData={formRegra}
      inputKey={formRegra.caracteristicaId}
      inputField="caracteristicaId"
      colunas={[
        { rotulo: "Característica", dataKey: "caracteristicaId", render: (a)=>cacheCaracteristicas?.map.get(a.caracteristicaId)?.nome ?? "-" },
        { rotulo: "Condição", dataKey: "operador", render: (a)=>OPERADOR[a.operador]?.nome },
        { rotulo: "Limite", dataKey: "limite" }
      ]}
      acoes={[]}
    >
      <StandardInput label="Regra" unidade={cacheCaracteristicas?.map.get(formRegra.caracteristicaId)?.medida.unidade ?? "-"}>
        <Form.Select
          value={formRegra.caracteristicaId}
          onChange={e => setFormRegra({...formRegra, caracteristicaId: e.target.value})}
        >
          {renderOptions({
            list: cacheCaracteristicas?.list.filter((a)=>a.aplicavel.planta),
            nullOption: true,
            loading: reading })}
        </Form.Select>
        <Form.Select
          value={formRegra.operador}
          onChange={e => setFormRegra({ ...formRegra, operador: e.target.value })}
          style={{ maxWidth: 150 }}
        >
          {renderOptions({
            list: Object.values(OPERADOR),
            placeholder: "Operador"
          })}
        </Form.Select>
        <Form.Control
          type="number"
          value={formRegra.limite}
          onChange={e => setFormRegra({ ...formRegra, limite: Number(e.target.value) })}
        />
      </StandardInput>
    </StandardObjectInput>
  );
}