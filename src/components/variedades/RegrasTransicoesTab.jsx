import { useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import InputGroupText from "react-bootstrap/esm/InputGroupText";
import { handleSelectIdNome, renderOptions } from "../../utils/formUtils";
import ListaAcoes from "../common/ListaAcoes";

export default function RegrasTransicoesTab({
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
    operador: "",
    limite: ""
  });

  const adicionarRegra = () => {
    if (!form.caracteristicaId || !form.operador) return;

    const novaRegra = {
      caracteristicaId: form.caracteristicaId,
      caracteristicaNome: form.caracteristicaNome,
      operador: form.operador,
      limite: Number(form.limite),
    };

    const regrasAtuais = Array.isArray(data.regras)
      ? data.regras
      : [];

    const novoData = [...regrasAtuais, novaRegra];
    onChange("transicoes", novoData, idx);
    setForm({ caracteristicaId: "", caracteristicaNome: "", operador: "", limite: "" });
  };

  const excluirRegra = (dataRegra,idxRegra) => {
    const regrasAtuais = Array.isArray(data.regras)
    ? data.regras
    : [];
    
    const novoData = regrasAtuais.filter((_, i) => i !== idxRegra);
    onChange("transicoes", novoData, idx);
  }

  return (
    <>
      <Form.Group className="d-flex-column gap-2">
        <Form.Label className="fw-semibold">Nova regra de transição</Form.Label>

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

          <Form.Select
            value={form.operador}
            onChange={e => setForm({ ...form, operador: e.target.value })}
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
            value={form.limite}
            onChange={e => setForm({ ...form, limite: e.target.value })}
          />

          <Button onClick={adicionarRegra}>Adicionar</Button>
        </InputGroup>
      </Form.Group>

      <ListaAcoes
        dados={data.regras || []}
        colunas={[
          { rotulo: "Característica", dataKey: "caracteristicaNome" },
          { rotulo: "Condição", dataKey: "operador" },
          { rotulo: "Limite", dataKey: "limite" }
        ]}
        acoes={[
          { rotulo: "Excluir", funcao: excluirRegra, variant: "danger" }
        ]}
      />
    </>
  );
}