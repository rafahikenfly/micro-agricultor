import { Form, InputGroup, } from "react-bootstrap";
import { handleSelectIdNome, renderOptions, StandardCard, StandardInput } from "../../utils/formUtils";
import { MODEL_TYPES } from "@shared/types/MODEL_TYPES"

export default function CvJobSpecsModelTab({ formModel, setFormModel, loading, cvModelos}) {
  return (
    <>
      <StandardCard header="Motores">
        <StandardInput label="Modelo de Inferência" width="35%">
          <Form.Select
            value={formModel.modelId}
            onChange={e => setFormModel({...formModel, modelId: e.target.value})}
          >
            {renderOptions({
              list: cvModelos,
              loading,
              placeholder: "Nenhum modelo selecionado",
              nullOption: true,
              valueKey: "nome",
            })}
          </Form.Select>
        </StandardInput>
        <StandardInput label="Versão" width="35%">
          <Form.Control
            type="number"
            value={formModel.version}
            onChange={e => setFormModel({
              ...formModel,
              modelVersion: e.target.value === "" ? "" : Number(e.target.value)
            })}
          />
        </StandardInput>
        <StandardInput label="Interpretador de Detecções" width="35%">
          <Form.Select
            value={formModel.modelType}
            onChange={e => setFormModel({...formModel, modelType: e.target.value})}
          >
            {renderOptions({
              list: MODEL_TYPES,
              loading,
              placeholder: "Nenhum tipo de interpretador",
              nullOption: true,
            })}
          </Form.Select>
        </StandardInput>
      </StandardCard>
      <StandardCard header="Parâmetros">
        <StandardInput label="Confiança alta">

        <Form.Control
          type="number"
          step="0.05"
          value={formModel.thresholds?.high ?? ""}
          onChange={e => setFormModel({
             ...formModel,
             thresholds: {
              ...formModel.thresholds,
              high: e.target.value === "" ? "" : Number(e.target.value)}
            })
          }
        />
        </StandardInput>
        <StandardInput label="Confiança baixa">
        <Form.Control
          type="number"
          step="0.05"
          value={formModel.thresholds?.low ?? ""}
          onChange={e => setFormModel({
            ...formModel,
            thresholds: {
              ...formModel.thresholds,
              low: e.target.value === "" ? "" : Number(e.target.value)}
            })
          }
        />
        </StandardInput>
        <StandardInput label="Tolerância">
          <Form.Control
            type="number"
            step="0.05"
            value={formModel.thresholds?.tolerance || 0}
            onChange={e => setFormModel({ ...formModel, thresholds: {...formModel.thresholds, tolerance: Number(e.target.value)} })}
          />
        </StandardInput>
      </StandardCard>
    </>
  );
}