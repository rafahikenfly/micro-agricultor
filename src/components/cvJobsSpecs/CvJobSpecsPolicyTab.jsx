import { Card, Col, Form, FormCheck, InputGroup, Row, } from "react-bootstrap";
import { renderOptions, StandardCard, StandardCheckboxGroup, StandardInput } from "../../utils/formUtils";
import { ROUTING_POLICIES } from "../../../shared/types/ROUTING_POLICIES";

export default function CvJobSpecsPolicyTab({ form, setForm, loading}) {
  return (
    <>
      <StandardCard header="Encaminhamento de Imagem">
        <StandardInput label="Confiança Média de Detecções > Alta" width="45%">
            <Form.Select
              value={form.onHighConfidence ?? ""}
              onChange={e => setForm({...form, onHighConfidence: e.target.value})}
            >
              {renderOptions({
                list: ROUTING_POLICIES,
                loading,
                placeholder: "Selecione uma política de encaminhamento",
              })}
            </Form.Select>
        </StandardInput>
        <StandardInput label="Confiança Média de Detecções < Baixa" width="45%">
            <Form.Select
              value={form.onLowConfidence ?? ""}
              onChange={e => setForm({...form, onLowConfidence: e.target.value})}
            >
              {renderOptions({
                list: ROUTING_POLICIES,
                loading,
                placeholder: "Selecione uma política de encaminhamento",
              })}
            </Form.Select>
        </StandardInput>
        <StandardInput label="Nenhuma detecção na inferência" width="45%">
            <Form.Select
              value={form.noDetection ?? ""}
              onChange={e => setForm({...form, noDetection: e.target.value})}
            >
              {renderOptions({
                list: ROUTING_POLICIES,
                loading,
                placeholder: "Selecione uma política de encaminhamento",
              })}
            </Form.Select>
        </StandardInput>
        <StandardInput label="Taxa de revisão aleatória (%)" width="45%">
            <Form.Control
              type="number"
              value={form.randomManualRate ?? ""}
              onChange={e => setForm({
                ...form,
                randomManualRate:
                e.target.value === "" ? "" : Number(e.target.value),
              })}
            />
        </StandardInput>
        <StandardCheckboxGroup label="Pós processamento">
          <FormCheck 
            label="Arquivar imagem original"
            checked={form.archiveOriginal ?? false}
            onChange={e => setForm({...form, archiveOriginal: e.target.checked})}
          />
          <FormCheck 
            label="Salvar imagem anotada"
            checked={form.saveAnnotated ?? false}
            onChange={e => setForm({...form, saveAnnotated: e.target.checked})}
          />
          <FormCheck 
            label="Manter imagem original no worker"
            checked={form.keepLocal ?? false}
            onChange={e => setForm({...form, keepLocal: e.target.checked})}
          />
        </StandardCheckboxGroup>
      </StandardCard>
      <StandardCard header="Política de Treinamento">
        TODO: Nada aqui ainda
      </StandardCard>
    </>
  );
}