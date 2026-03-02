import { useState } from "react";
import { Form, InputGroup, Button, } from "react-bootstrap";
import InputGroupText from "react-bootstrap/esm/InputGroupText";

import { handleSelectIdNome, renderOptions, StandardObjArrayInput, StandardObjectInput } from "../../../utils/formUtils";

import ListaAcoes from "../../../components/common/ListaAcoes";

export default function RegrasAmbienteTab({ formAmbiente, idxCiclo, caracteristicas = [], loading, setFormAmbiente }) {
  if (!formAmbiente) return null;

  const [formRegra, setFormRegra] = useState({
    caracteristicaId: "",
    caracteristicaNome: "",
    min: 0,
    max: 0,
  });

  /*TODO: ARRUMAR O STANDARDOBJECTINPUT PARA OUTROS CONTEXTOS (USA CARACTERISTICAID HARDCODED*/
  return (
    <StandardObjectInput
      object={formAmbiente ?? {}}
      header="Condição"
      colunas={[
        { rotulo: "Característica", dataKey: "caracteristicaNome" },
        { rotulo: "Mínimo", dataKey: "min" },
        { rotulo: "Máximo", dataKey: "max" }
      ]}
      acoes={[]}
      novoItem={formRegra}
      onChange={(ambiente)=>setFormAmbiente(idxCiclo, ambiente)}
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
      <InputGroupText>Min</InputGroupText>
      <Form.Control
        type="number"
        value={formRegra.min}
        onChange={(e) => setFormRegra({ ...formRegra, min: Number(e.target.value) })}
      />
      <InputGroupText>Max</InputGroupText>
      <Form.Control
        type="number"
        value={formRegra.max}
        onChange={(e) => setFormRegra({ ...formRegra, max: Number(e.target.value) })}
      />
    </StandardObjectInput>
  );
}