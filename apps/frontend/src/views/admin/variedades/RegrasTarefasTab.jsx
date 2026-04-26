import { useEffect, useState } from "react";
import { Form,  } from "react-bootstrap";
import { VARIANTE } from "micro-agricultor";

import { renderOptions, StandardArrayInput, StandardInput } from "../../../utils/formUtils";
import { useCache } from "../../../hooks/useCache";
import { OPERADOR } from "micro-agricultor/types/OPERADOR";


export default function RegrasTarefasTab({ formTarefas, idxCiclo, setFormTarefas, header = "Regras de manejo neste estágio" }) {
  if (!formTarefas) return null;

  const { cacheCaracteristicas, reading } = useCache(["caracteristicas"]);

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
  return (
    <StandardArrayInput
      form={formTarefas ?? []}
      inputLabel={header}
      inputData={formRegra}
      setForm={setFormTarefas}
      colunas={[
        { rotulo: "Característica", dataKey: "caracteristicaId", render: (a)=>cacheCaracteristicas?.map.get(a.caracteristicaId)?.nome ?? "-" },
        { rotulo: "Condição", dataKey: "operador", render: (a)=>OPERADOR[a.operador]?.nome },
        { rotulo: "Limite", dataKey: "limite" }
      ]}
      acoes={[
        { rotulo: "Associar Manejos", funcao: ()=>{}, variant: VARIANTE.LIGHTBLUE.variant },
      ]}
      novoItem={formRegra}
    >
      <StandardInput label="Regra">
        <Form.Select
          value={formRegra.caracteristicaId}
          onChange={e => setFormRegra({...formRegra, caracteristicaId: e.target.value})}
        >
          {renderOptions({
            list: cacheCaracteristicas?.list,
            placeholder: "Selecione a característica",
            loading: reading
          })}
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
    </StandardArrayInput>
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