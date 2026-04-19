import { useEffect, useState } from "react";
import { Form,  } from "react-bootstrap";
import InputGroupText from "react-bootstrap/esm/InputGroupText";
import { VARIANT_TYPES } from "micro-agricultor";

import { handleSelectIdNome, renderOptions, StandardArrayInput, StandardObjectInput } from "../../../utils/formUtils";


export default function RegrasTarefasTab({ formTarefas, idxCiclo, setFormTarefas, caracteristicas = [], manejos = [], loading }) {
  if (!formTarefas) return null;

  const [showModal, setShowModal] = useState(false);
  const [regraSelecionada, setRegraSelecionada] = useState(null);
  const [regraSelecionadaIdx, setRegraSelecionadaIdx] = useState(null);

  const [formRegra, setFormRegra] = useState({
    caracteristicaId: "",
    caracteristicaNome: "",
    operador: "",
    limite: 0,
    manejos: [],
  });

  useEffect(() => {
    if (regraSelecionadaIdx !== null) {
      const regra = formTarefas?.regras?.[regraSelecionadaIdx];
      if (regra) {
        setFormRegra({
          caracteristicaId: regra.caracteristicaId || "",
          caracteristicaNome: regra.caracteristicaNome || "",
          operador: regra.operador || "",
          limite: regra.limite || "",
          manejos: regra.manejos || [],
        });
      }
    }
  }, [regraSelecionadaIdx, formTarefas]);
  
  const adicionarRegra = () => {
    if (!formRegra.caracteristicaId || !formRegra.operador) return;

    const novaRegra = {
      caracteristicaId: formRegra.caracteristicaId,
      caracteristicaNome: formRegra.caracteristicaNome,
      operador: formRegra.operador,
      limite: Number(formRegra.limite),
      manejos: formRegra.manejos,
    };

    const regrasAtuais = Array.isArray(formTarefas.regras)
      ? formTarefas.regras
      : [];

    const novoData = [...regrasAtuais, novaRegra];
    setFormTarefas("tarefas", novoData, idxCiclo);
    setFormRegra({ caracteristicaId: "", caracteristicaNome: "", operador: "", limite: "", manejos: [] });
  };

  const excluirRegra = (dataRegra,idxRegra) => {
    const regrasAtuais = Array.isArray(formTarefas.regras)
    ? formTarefas.regras
    : [];
    
    const novoData = regrasAtuais.filter((_, i) => i !== idxRegra);
    setFormTarefas("tarefas", novoData, idxCiclo);
  }

  const atualizarManejosRegra = (manejos, idxRegra) => {
    if (!Array.isArray(manejos)) return;

    const regrasAtuais = Array.isArray(formTarefas.regras)
      ? formTarefas.regras
      : [];

    const novoData = regrasAtuais.map((regra, i) =>
      i === idxRegra
        ? { ...regra, manejos }   // só substitui os manejos
        : regra
    );

    setFormTarefas("tarefas", novoData, idxCiclo);
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
    const regrasAtuais = Array.isArray(formTarefas.regras)
      ? formTarefas.regras
      : [];

      const novoData = regrasAtuais.map((regra, i) =>
        i === idxRegra
          ? { ...regra, manejos }   // substitui só os manejos da regra certa
          : regra
      );
      setFormTarefas("tarefas", novoData, idxCiclo);
  }

  //TODO: MODAL DE ASSOCIAÇÃO DE MANEJOS À REGRA
  //TODO: OPERADOR_TYPES NO SHARED E ITERAR AQUI
  return (
    <>
    <StandardArrayInput
      form={formTarefas ?? []}
      header="Tarefa condicionada à característica"
      headerData={formRegra}
      setForm={(tarefas)=> setFormTarefas(idxCiclo, tarefas)}
      colunas={[
        { rotulo: "Característica", dataKey: "caracteristicaNome" },
        { rotulo: "Condição", dataKey: "operador" },
        { rotulo: "Limite", dataKey: "limite" }
      ]}
      acoes={[
        { rotulo: "Associar Manejos", funcao: ()=>{}, variant: VARIANT_TYPES.GREY },
      ]}
      novoItem={formRegra}
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

    </StandardArrayInput>
    </>
  );
}
/**
      <AssociarManejosModal
        show={showModal}
        onClose={hideModalManejos}
        form={formTarefa}
        idxRegra={regraSelecionadaIdx}
        onChange={atualizarManejosRegra}
        catalogoManejos={manejos}
        loading={loading}
      />

 */