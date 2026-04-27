import { useEffect, useState } from "react";
import { Form,  } from "react-bootstrap";
import { VARIANTE } from "micro-agricultor";

import { renderOptions, StandardArrayInput, StandardInput } from "../../../utils/formUtils";
import { useCache } from "../../../hooks/useCache";
import { OPERADOR } from "micro-agricultor/types/OPERADOR";


export default function RecorrenteTarefasTab({ formTarefas, idxCiclo, setFormTarefas, header = "Tarefas recorrentes neste estágio" }) {
  if (!formTarefas) return null;

  const { cacheCaracteristicas, reading } = useCache(["caracteristicas"]);

  const [regraSelecionadaIdx, setRegraSelecionadaIdx] = useState(null);

  const [formRegra, setFormRegra] = useState({
    caracteristicaId: "",
    caracteristicaNome: "",
    recorrenciaId: "",
    manejoId: "",
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
  
  return (
    <StandardArrayInput
      form={formTarefas ?? []}
      inputLabel={header}
      inputData={formRegra}
      setForm={setFormTarefas}
      colunas={[
        { rotulo: "Recorrência", dataKey: "tipoRecorrenciaId"},
        { rotulo: "Condição", dataKey: "operador"},
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