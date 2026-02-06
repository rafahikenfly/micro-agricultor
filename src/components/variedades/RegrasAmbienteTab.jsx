import { useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import InputGroupText from "react-bootstrap/esm/InputGroupText";
import { handleSelectIdNome, renderOptions } from "../../utils/formUtils";
import ListaAcoes from "../common/ListaAcoes";

export default function RegrasAmbienteTab({
  data,
  idx,
  caracteristicas = [],
  loading,
  onChange = () => {}
}) {
  if (!data) return null;

  const [form, setForm] = useState({
    caracteristicaId: "",
    caracteristicaNome: "",
    min: "",
    max: ""
  });

  const adicionarRegra = () => {
    if (!form.caracteristicaId) return;

    const novaRegra = {
      caracteristicaId: form.caracteristicaId,
      caracteristicaNome: form.caracteristicaNome,
      min: Number(form.min),
      max: Number(form.max),
    };

    const novoData = { [form.caracteristicaId]: novaRegra };
    onChange("ambiente", novoData, idx);
    setForm({ caracteristicaId: "", caracteristicaNome: "", min: "", max: "" });
  };

  const excluirRegra = (dataRegra, idxRegra) => {
    const regrasAtuais = data.regras && typeof data.regras === "object"
      ? data.regras
      : {};
    
    const { [dataRegra.caracteristicaId]: removed, ...novoData } = regrasAtuais;

    onChange("ambiente", novoData, idx, true);
  }


  return (
    <>
      {/* Nova regra */}
      <Form.Group className="d-flex-column gap-2">
        <Form.Label className="fw-semibold">Nova regra ambiental</Form.Label>

        <InputGroup>
          <Form.Select
            value={form.caracteristicaId}
            onChange={e =>
              handleSelectIdNome(e, {
                list: caracteristicas,
                setForm,
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
            value={form.min}
            onChange={e => setForm({ ...form, min: e.target.value })}
          />

          <InputGroupText>Max</InputGroupText>
          <Form.Control
            type="number"
            value={form.max}
            onChange={e => setForm({ ...form, max: e.target.value })}
          />

          <Button onClick={adicionarRegra}>Adicionar</Button>
        </InputGroup>
      </Form.Group>

      {/* Lista */}
      <ListaAcoes
        dados={Object.values(data.regras || {})}
        colunas={[
          { rotulo: "Característica", dataKey: "caracteristicaNome" },
          { rotulo: "Mínimo", dataKey: "min" },
          { rotulo: "Máximo", dataKey: "max" }
        ]}
        acoes={[
          { rotulo: "Excluir", funcao: excluirRegra, variant: "danger" }
        ]}
      />
    </>
  );
}