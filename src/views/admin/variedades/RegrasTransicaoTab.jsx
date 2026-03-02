import { useState } from "react";
import { Form } from "react-bootstrap";
import InputGroupText from "react-bootstrap/esm/InputGroupText";

import { handleSelectIdNome, renderOptions, StandardObjectInput } from "../../../utils/formUtils";

import ListaAcoes from "../../../components/common/ListaAcoes";

export default function RegrasTransicaoTab({ formTransicoes, idxCiclo, caracteristicas = [], loading, setFormTransicoes }) {
  if (!formTransicoes) return null;

  const [formRegra, setFormRegra] = useState({
    caracteristicaId: "",
    caracteristicaNome: "",
    operador: "",
    limite: 0,
  });

  return (
    <StandardObjectInput
      object={formTransicoes ?? {}}
      header="Condição"
      colunas={[
        { rotulo: "Característica", dataKey: "caracteristicaNome" },
        { rotulo: "Condição", dataKey: "operador" },
        { rotulo: "Limite", dataKey: "limite" }
      ]}
      acoes={[]}
      novoItem={formRegra}
      onChange={(ambiente)=>setFormTransicoes(idxCiclo, ambiente)}
    >
      <Form.Select
        value={formRegra.caracteristicaId}
        onChange={e =>
          handleSelectIdNome(e, {
            list: caracteristicas,
            setForm: setFormRegra,
            fieldId: "caracteristicaId",
            fieldNome: "caracteristicaNome"
          })
        }
      >
        {renderOptions({ list: caracteristicas, nullOption: true, loading })}
      </Form.Select>
      <Form.Select
        value={formRegra.operador}
        onChange={e => setFormRegra({ ...formRegra, operador: e.target.value })}
        style={{ maxWidth: 110 }}
      >
        <option value="">Op</option>
        <option value=">=">≥</option>
        <option value="==">=</option>
        <option value="<=">≤</option>
      </Form.Select>

      <InputGroupText>Limite</InputGroupText>
      <Form.Control
        type="number"
        value={formRegra.limite}
        onChange={e => setFormRegra({ ...formRegra, limite: Number(e.target.value) })}
      />

    </StandardObjectInput>
  );
}