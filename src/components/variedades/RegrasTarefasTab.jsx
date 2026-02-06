import { useEffect, useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import InputGroupText from "react-bootstrap/esm/InputGroupText";
import { handleSelectIdNome, renderOptions } from "../../utils/formUtils";
import ListaAcoes from "../common/ListaAcoes";
import AssociarManejosModal from "./AssociarManejosModal";

export default function RegrasTarefasTab({
  data,
  idx,
  caracteristicas = [],
  manejos = [],
  loading,
  onChange = () => {}
}) {
  if (!data) return null;

  const [showModal, setShowModal] = useState(false);
  const [regraSelecionada, setRegraSelecionada] = useState(null);
  const [regraSelecionadaIdx, setRegraSelecionadaIdx] = useState(null);

  const [form, setForm] = useState({
    caracteristicaId: "",
    caracteristicaNome: "",
    operador: "",
    limite: "",
    manejos: [],
  });

  useEffect(() => {
    if (regraSelecionadaIdx !== null) {
      const regra = data?.regras?.[regraSelecionadaIdx];
      if (regra) {
        setForm({
          caracteristicaId: regra.caracteristicaId || "",
          caracteristicaNome: regra.caracteristicaNome || "",
          operador: regra.operador || "",
          limite: regra.limite || "",
          manejos: regra.manejos || [],
        });
      }
    }
  }, [regraSelecionadaIdx, data]);
  
  const adicionarRegra = () => {
    if (!form.caracteristicaId || !form.operador) return;

    const novaRegra = {
      caracteristicaId: form.caracteristicaId,
      caracteristicaNome: form.caracteristicaNome,
      operador: form.operador,
      limite: Number(form.limite),
      manejos: form.manejos,
    };

    const regrasAtuais = Array.isArray(data.regras)
      ? data.regras
      : [];

    const novoData = [...regrasAtuais, novaRegra];
    onChange("tarefas", novoData, idx);
    setForm({ caracteristicaId: "", caracteristicaNome: "", operador: "", limite: "", manejos: [] });
  };

  const excluirRegra = (dataRegra,idxRegra) => {
    const regrasAtuais = Array.isArray(data.regras)
    ? data.regras
    : [];
    
    const novoData = regrasAtuais.filter((_, i) => i !== idxRegra);
    onChange("tarefas", novoData, idx);
  }

  const atualizarManejosRegra = (manejos, idxRegra) => {
    if (!Array.isArray(manejos)) return;

    const regrasAtuais = Array.isArray(data.regras)
      ? data.regras
      : [];

    const novoData = regrasAtuais.map((regra, i) =>
      i === idxRegra
        ? { ...regra, manejos }   // só substitui os manejos
        : regra
    );

    onChange("tarefas", novoData, idx);
    //    (manejos) => setForm(prev => ({ ...prev, manejos }))
  };
  const showModalManejos = (regra, idxRegra) => {
    setRegraSelecionadaIdx(idxRegra)
    setShowModal(true);
  }

  const hideModalManejos = () => {
    setRegraSelecionadaIdx(null)
    setShowModal(false);
  }

  const salvarManejos = (manejos, idxRegra) => {
    const regrasAtuais = Array.isArray(data.regras)
      ? data.regras
      : [];

      const novoData = regrasAtuais.map((regra, i) =>
        i === idxRegra
          ? { ...regra, manejos }   // substitui só os manejos da regra certa
          : regra
      );
      onChange("tarefas", novoData, idx);
  }

  return (
    <>
      <Form.Group className="d-flex-column gap-2">
        <Form.Label className="fw-semibold">Nova regra de tarefa</Form.Label>

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
          { rotulo: "Associar Manejos", funcao: showModalManejos, variant: "info" },
          { rotulo: "Excluir", funcao: excluirRegra, variant: "danger" }
        ]}
      />

      <AssociarManejosModal
        show={showModal}
        onClose={hideModalManejos}
        form={form}
        idxRegra={regraSelecionadaIdx}
        onChange={atualizarManejosRegra}
        catalogoManejos={manejos}
        loading={loading}
      />

    </>
  );
}