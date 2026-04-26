import { useState } from "react";
import { Form } from "react-bootstrap";
import { handleSelectIdNome, renderOptions, StandardInput, StandardArrayInput } from "../../../utils/formUtils";
import { EFEITO } from "micro-agricultor";
import { useCache } from "../../../hooks/useCache";

export default function ManejoEfeitosTab({ formEfeitos, setFormEfeitos }) {
    const { cacheCaracteristicas, reading } = useCache(["caracteristicas"]);
    
  

  const [formCaracteristicaAfetada, setFormCaracteristicaAfetada] = useState({
    caracteristicaId: "",
    tipoEfeitoValorId: "",
    efeitoValor: 0,
    tipoEfeitoConfiancaId: "",
    efeitoConfianca: 0,
  });

  const inputEnabled = () => {
    const temCaracteristica = !!formCaracteristicaAfetada.caracteristicaId;
    const temValorCompleto = !!formCaracteristicaAfetada.tipoEfeitoValorId;
    const temConfiancaCompleto = !!formCaracteristicaAfetada.tipoEfeitoConfiancaId;

    return temCaracteristica && temValorCompleto && temConfiancaCompleto;
  }
  return (
    <StandardArrayInput
      form={formEfeitos ?? []}
      setForm={(efeitos)=>setFormEfeitos(efeitos)}
      inputLabel="Novo efeito"
      inputButtonIsDisabled={
        formCaracteristicaAfetada.caracteristicaId === "" ||
        formCaracteristicaAfetada.tipoEfeitoValorId === "" ||
        formCaracteristicaAfetada.tipoEfeitoConfiancaId === ""
      }
      inputData={formCaracteristicaAfetada}
      colunas={[
        { rotulo: "Característica", dataKey: "caracteristicaNome" },
        { rotulo: "Tipo", dataKey: "tipoEfeitoValorNome" },
        { rotulo: "Valor", dataKey: "efeitoValor" },
        { rotulo: "Tipo", dataKey: "tipoEfeitoConfiancaNome" },
        { rotulo: "Confiança", dataKey: "efeitoConfianca" },
      ]}
      acoes={[]}
    >
      <StandardInput label="Característica">
        <Form.Select
          value={formCaracteristicaAfetada.id}
          onChange={e => setFormCaracteristicaAfetada({...formCaracteristicaAfetada, caracteristicaId: e.target.value})}
        >
          {renderOptions({
            list: cacheCaracteristicas?.list,
            loading: reading,
            placeholder: "Selecione a característica afetada",
            nullOption: true,
          })}
        </Form.Select>
      </StandardInput>
      <StandardInput label="Efeito">
        <Form.Select
          value={formCaracteristicaAfetada.tipoEfeitoValorId}
          onChange={e => setFormCaracteristicaAfetada({...formCaracteristicaAfetada, tipoEfeitoValorId: e.target.value})}
        >
          {renderOptions({
            list: Object.values(EFEITO),
            placeholder: "Selecione o tipo de efeito no valor da característica",
          })}
        </Form.Select>
        <Form.Control
          type="number"
          step="0.01"
          value={formCaracteristicaAfetada.efeitoValor}
          onChange={e => setFormCaracteristicaAfetada({...formCaracteristicaAfetada, efeitoValor: Number(e.target.value)})}
          placeholder="Valor"
        />
      </StandardInput>
      <StandardInput label="Confiança">
        <Form.Select
          value={formCaracteristicaAfetada.tipoEfeitoConfiancaId}
          onChange={e => setFormCaracteristicaAfetada({...formCaracteristicaAfetada, tipoEfeitoConfiancaId: e.target.value})}
        >
          {renderOptions({
            list: Object.values(EFEITO),
            placeholder: "Selecione o tipo de efeito na confiança do valor da característica",
          })}
        </Form.Select>
          <Form.Control
            type="number"
            step="1"
            value={formCaracteristicaAfetada.efeitoConfianca}
            onChange={e => setFormCaracteristicaAfetada({...formCaracteristicaAfetada, efeitoConfianca: Number(e.target.value)})}
            placeholder="Confiança"
          />
      </StandardInput>
    </StandardArrayInput>
  );
}