import { useState } from "react";
import { Form } from "react-bootstrap";

import { renderOptions, StandardObjArrayInput, StandardInput } from "../../../utils/formUtils";

export default function HortaMembrosTab({ formMembros, setFormMembros, usuarios, loading}) {
  const [novoMembro, setNovoMembro] = useState("");

//  console.log(formMembros)
  return (
   <StandardObjArrayInput
    array = {formMembros}
    data = {usuarios.filter((m)=>formMembros.some(membro => membro === m.id))}
    colunas = {[
        {rotulo: "Nome", dataKey: "nome" },        
    ]}
    onChange = {setFormMembros}
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

   </StandardObjArrayInput>
  )
}