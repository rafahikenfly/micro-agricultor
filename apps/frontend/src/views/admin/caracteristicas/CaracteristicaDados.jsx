import { Badge, Form } from "react-bootstrap"
import BaseTab from "../../../components/common/BaseTab"
import { renderOptions, StandardCheckboxGroup, StandardInput } from "../../../utils/formUtils"
import { ENTIDADE, VARIANTE } from "micro-agricultor"

export default function CaracteristicasDados ({form, setForm}) {
  return (
    <BaseTab
      form={form}
      setForm={setForm}
    >
      <StandardCheckboxGroup label="Aplicável a:">
        {Object.values(ENTIDADE).map((tipo) => (
          <Form.Check
          key={tipo.id}
            type="checkbox"
            label={tipo.nome}
            checked={!!form.aplicavel?.[tipo.id]}
            onChange={(e) =>
              setForm({
                ...form,
                aplicavel: {
                  ...form.aplicavel,
                  [tipo.id]: e.target.checked
              }
              })
            }
          />
        ))}
      </StandardCheckboxGroup>
      <StandardInput label="Tag">
        <Form.Select
        value={form.variant}
          onChange={e => setForm({...form, variant: e.target.value})}
          required
        >
          {renderOptions({
            list: Object.values(VARIANTE),
            placeholder: "Selecione a cor da tag",
          })}
        </Form.Select>
        <Badge bg={VARIANTE[form.variant]?.variant}> </Badge>
      </StandardInput>
    </BaseTab>
  )
}