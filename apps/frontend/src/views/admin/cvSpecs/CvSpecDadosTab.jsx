import { Badge, Form } from "react-bootstrap";
import { VARIANTE } from "@shared/types/VARIANT_TYPES";
import { renderOptions, StandardCheckboxGroup, StandardInput } from "../../../utils/formUtils";
import BaseTab from "../../../components/common/BaseTab";
import { ENTIDADE } from "@shared/types/ENTITY_TYPES";

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
            {Object.values(ENTIDADE).map((tipo) => (
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
              list: Object.values(VARIANTE),
              placeholder: "Selecione a cor da tag",
            })}
          </Form.Select>
          <Badge bg={form.tagVariant}> </Badge>
        </StandardInput>
      </BaseTab>
      </>
    )
}