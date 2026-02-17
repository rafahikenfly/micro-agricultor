import { Badge, Form } from "react-bootstrap";
import { VARIANTS } from "../../utils/consts/VARIANTS";
import { TIPOS_ENTIDADE } from "../../utils/consts/TIPOS_ENTIDADE";
import { renderOptions, StandardCheckboxGroup, StandardInput } from "../../utils/formUtils";
import BaseTab from "../common/BaseTab";

export default function CvJobSpecsDadosTab({ form, setForm, }) {
    return (
      <>
      <BaseTab
        form={form}
        setForm={setForm}
      >
        <StandardInput label="Instruções para captura de imagem" stacked>
          <Form.Control
            as="textarea"
            rows={3}
            value={form.instrucoes}
            onChange={e => setForm({...form, instrucoes: e.target.value})}
          />
        </StandardInput>
        <StandardCheckboxGroup label="Aplicável a">
            {TIPOS_ENTIDADE.map((tipo) => (
              <Form.Check
                key={tipo.id}
                type="switch"
                label={tipo.nome}
                checked={!!form.aplicavel?.[tipo.id]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    aplicavel: {...form.aplicavel, [tipo.id]: e.target.checked }
                  })
                }
              />
            ))}
        </StandardCheckboxGroup>
        <StandardInput label="Cor da Tag">
          <Form.Select
            value={form.tagVariant}
            onChange={e => setForm({...form, tagVariant: e.target.value})}
            label="Cor da Tag"
            required
          >
            {renderOptions({
              list: VARIANTS,
              placeholder: "Selecione a cor da tag",
            })}
          </Form.Select>
          <Badge bg={form.tagVariant}> </Badge>
        </StandardInput>
      </BaseTab>
      </>
    )
}