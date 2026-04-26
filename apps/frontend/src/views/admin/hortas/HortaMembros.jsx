import { useState } from "react";
import { Form } from "react-bootstrap";

import { renderOptions, StandardArrayInput, StandardInput } from "../../../utils/formUtils";

export default function HortaMembrosTab({ formMembros, setFormMembros, usuarios, loading}) {
  const [novoMembro, setNovoMembro] = useState("");

//  console.log(formMembros)
  return (
   <StandardArrayInput
    form = {formMembros}
    setForm = {setFormMembros}
    colunas = {[
        {rotulo: "Nome", dataKey: "nome" },        
    ]}
    novoItem = {novoMembro}
   >
    <StandardInput label="Novo Membro">
      <Form.Select
        value={novoMembro}
        onChange={(e)=>setNovoMembro(e.target.value)}
        >
        {renderOptions({
            list: usuarios,
            loading,
            placeholder: "Selecione o novo usuário",
            valueKey: "id",
            nullOption: true,
            isOptionDisabled: (m)=>formMembros.some(membro => membro === m.id)
        })}
      </Form.Select>
    </StandardInput>

   </StandardArrayInput>
  )
}