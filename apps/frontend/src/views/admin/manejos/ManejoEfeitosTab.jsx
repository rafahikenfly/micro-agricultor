import { useState } from "react";
import { Form } from "react-bootstrap";
import { handleSelectIdNome, renderOptions, StandardInput, StandardArrayInput } from "../../../utils/formUtils";
import { EFEITO_VALOR } from "micro-agricultor";

export default function ManejoEfeitosTab({
  formEfeitos,
  setFormEfeitos,
  caracteristicas,
  loading,
}) {

  const [formCaracteristicaAfetada, setFormCaracteristicaAfetada] = useState({
    caracteristicaId: "",
    caracteristicaNome: "",
    tipoEfeitoValorId: "",
    tipoEfeitoValorNome: "",
    efeitoValor: 0,
    tipoEfeitoConfiancaId: "",
    tipoEfeitoConfiancaNome: "",
    efeitoConfianca: 0,
  });

  const headerEnabled = () => {
    const temCaracteristica = !!formCaracteristicaAfetada.caracteristicaId;
    const temValorCompleto = !!formCaracteristicaAfetada.tipoEfeitoValorId;
    const temConfiancaCompleto = !!formCaracteristicaAfetada.tipoEfeitoConfiancaId;

    return temCaracteristica && temValorCompleto && temConfiancaCompleto;
  }
  return (
    <>
      <StandardArrayInput
        form={formEfeitos ?? []}
        setForm={(efeitos)=>setFormEfeitos(efeitos)}
        header="Novo efeito"
        headerData={formCaracteristicaAfetada}
        headerDisabled={!headerEnabled()}
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
            onChange={e =>
              handleSelectIdNome(e, {
                list: caracteristicas,
                setForm: setFormCaracteristicaAfetada,
                fieldId: "caracteristicaId",
                fieldNome: "caracteristicaNome"
              })
            }
          >
            {renderOptions({
              list: caracteristicas,
              loading,
              placeholder: "Selecione a característica afetada",
              nullOption: true,
            })}
          </Form.Select>
        </StandardInput>
        <StandardInput label="Efeito">
          <Form.Select
            value={formCaracteristicaAfetada.tipoEfeitoValorId}
            onChange={e => handleSelectIdNome(e, {
              list: Object.values(EFEITO_VALOR),
              setForm: setFormCaracteristicaAfetada,
              fieldId: "tipoEfeitoValorId",
              fieldNome: "tipoEfeitoValorNome",
            })}
          >
            {renderOptions({
              list: Object.values(EFEITO_VALOR),
              loading,
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
            onChange={e => handleSelectIdNome(e, {
              list: Object.values(EFEITO_VALOR),
              setForm: setFormCaracteristicaAfetada,
              fieldId: "tipoEfeitoConfiancaId",
              fieldNome: "tipoEfeitoConfiancaNome",
            })}
          >
            {renderOptions({
              list: Object.values(EFEITO_VALOR),
              loading,
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
    </>
  );
}