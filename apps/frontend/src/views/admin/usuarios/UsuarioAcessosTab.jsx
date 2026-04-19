import { Form } from "react-bootstrap";
import { AMBIENTE } from "micro-agricultor";
import { StandardCheckboxGroup } from "../../../utils/formUtils";

export default function UsuarioAcessosTab({ formAcesso, setFormAcesso }) {
  if (!formAcesso) formAcesso = {}
  return (
    <StandardCheckboxGroup
      label = "Ambientes"
    >
      {Object.values(AMBIENTE).map((a)=> (
        <Form.Check
          type="checkbox"
          id={`acesso-${a.id}`}
          label={a.nome}
          checked={!!formAcesso?.[a.id]}
          onChange={(e) => setFormAcesso({...formAcesso, [a.id]: e.target.checked})}
        />
      ))}
    </StandardCheckboxGroup>
  );
}