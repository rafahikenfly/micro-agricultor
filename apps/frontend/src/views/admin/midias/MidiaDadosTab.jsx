import { Form, } from "react-bootstrap";
import { MIDIA, MIME_TYPES } from "micro-agricultor";

import { StandardInput, renderOptions } from "../../../utils/formUtils";
import BaseTab from "../../../components/common/BaseTab";

export default function MidiaDadosTab({ form, setForm }) {
  return (
    <BaseTab
      form={form}
      setForm={setForm}
    >
      <StandardInput
        label="Tipo de Mídia"
      >
        <Form.Select
        value={form.tipoMediaId}
        onChange={e => setForm({...form, tipoMediaId: e.target.value})}
        >
        {renderOptions({
            list: Object.values(MIDIA),
            placeholder: "Selecione o tipo de mídia",
        })}
        </Form.Select>
      </StandardInput>
      <StandardInput
        label="MIME Type"
      >
        <Form.Select
        value={form.mimeType}
        onChange={e => setForm({...form, mimeType: e.target.value})}>
        {renderOptions({
            list: Object.values(MIME_TYPES),
            placeholder: "Selecione o tipo MIME de conteúdo",
        })}
        </Form.Select>
      </StandardInput>
      <StandardInput label="Estado">
        <Form.Control
          value = {form.estado}
          onChange={e => setForm({...form, estado: e.target.value})}
        />
      </StandardInput>
      <StandardInput label="Último Run">
        <Form.Control
          value = {form.ultimoRunId}
          onChange={e => setForm({...form, ultimoRunId: e.target.value})}
        />
      </StandardInput>
    </BaseTab>
  );
}
