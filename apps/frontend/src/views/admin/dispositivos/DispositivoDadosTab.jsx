import { Form, Badge } from "react-bootstrap";
import { renderOptions, StandardInput } from "../../../utils/formUtils";
import BaseTab from "../../../components/common/BaseTab";
import { DISPOSITIVO } from "micro-agricultor/types/DISPOSITIVO";

export const DispositivoDadosTab = ({ form, setForm, }) => {
    return (
              <BaseTab
                form={form}
                setForm={setForm}
              >
                <StandardInput label="Tipo de dispositivo">
                  <Form.Select
                    value={form.tipoDispositivoId}
                    onChange={e => setForm({...form, variant: e.target.value})}
                    required
                  >
                    {renderOptions({
                      list: Object.values(DISPOSITIVO),
                      placeholder: "Selecione o tipo de dispositivo",
                    })}
                  </Form.Select>
                  <Badge bg={DISPOSITIVO[form.tipoDispositivoId]?.variant}> </Badge>
                </StandardInput>
              </BaseTab>
    )
}

