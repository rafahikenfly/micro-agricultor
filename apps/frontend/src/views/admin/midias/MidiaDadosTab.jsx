import { Form, } from "react-bootstrap";
import { CVRUN_ESTADO, MIDIA, MIME_TYPES } from "micro-agricultor";

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
      <StandardInput label="Estado do Processamento">
        <Form.Select
          value = {form.estado}
          onChange={e => setForm({...form, estado: e.target.value})}>
        {renderOptions({
            list: Object.values(CVRUN_ESTADO),
            placeholder: "Selecione o estado do processamento do conteúdo",
        })}
        </Form.Select>
      </StandardInput>
      <StandardInput label="Último Run">
        <Form.Control
          value = {form.ultimoRunId}
          onChange={e => setForm({...form, ultimoRunId: e.target.value})}
          disabled
        />
      </StandardInput>
    </BaseTab>
  );
}
