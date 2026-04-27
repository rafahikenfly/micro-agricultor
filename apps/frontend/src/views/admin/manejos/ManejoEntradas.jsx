import { useState } from "react";
import { Form } from "react-bootstrap";
import { handleSelectIdNome, renderOptions, StandardInput, StandardArrayInput, StandardCheckboxGroup, } from "../../../utils/formUtils";

export default function ManejoEntradasTab({
  formEntradas,
  setFormEntradas,
  loading,
}) {

  const [formNovaEntrada, setFormNovaEntrada] = useState({
    tipoEntradaId: "",
    tipoEntradaNome: "",
    obrigatorio: false,
  });

  const headerEnabled = () => {
    const temTipoEntrada = !!formNovaEntrada.tipoEntradaId;

    return temTipoEntrada
  }

  const ENTRADA = {
    NUMBER: {id: "number", nome: "Número"},
    TEXT: {id: "text", nome: "Texto"},
  }
  return (
    <>
    TODO!
      <StandardArrayInput
        form={formEntradas ?? []}
        setForm={(entradas)=>setFormEntradas(entradas)}
        inputLabel="Nova entrada"
        inputData={formNovaEntrada}
        inputButtonIsDisabled={!headerEnabled()}
        colunas={[
          { rotulo: "Tipo", dataKey: "tipoEntradaNome" },
          { rotulo: "Obrigatório", dataKey: "obrigatorio", render: (a)=> <Badge bg={a.obrigatorio ? VARIANTE.LIGHTBLUE.variant : VARIANTE.RED.variant}>{a[col.dataKey] ? "Sim" : "Não"}</Badge> },
        ]}
        acoes={[]}
      >
        <StandardInput label="Tipo de Entrada">
          <Form.Select
            value={formNovaEntrada.id}
            onChange={e =>
              handleSelectIdNome(e, {
                list: Object.values(ENTRADA),
                setForm: setFormNovaEntrada,
                fieldId: "tipoEntradaId",
                fieldNome: "tipoEntradaNome"
              })
            }
          >
            {renderOptions({
              list: Object.values(ENTRADA),
              loading,
              placeholder: "Selecione o tipo de entrada",
              nullOption: true,
            })}
          </Form.Select>
        </StandardInput>
        <StandardCheckboxGroup label="Opções">
          <Form.Check
            label="Obrigatório"
            checked={formNovaEntrada.obrigatorio}
            onChange={e => setFormNovaEntrada({...formNovaEntrada, obrigatorio: e.target.checked})}
          />
        </StandardCheckboxGroup>
      </StandardArrayInput>
    </>
  );
}