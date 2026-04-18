import { Form, } from "react-bootstrap";
import { StandardInput } from "../../../utils/formUtils";


// TODO: resultados: {}, // bounding boxes, labels, etc.
export default function MidiaInferencia({ formInferencia, setFormInferencia }) {
  if (!formInferencia) return <>Visão computacional não concluída</>
  return (
    <>
      <StandardInput label="Id do Modelo">
        <Form.Control
          value={formInferencia.modeloId}
          onChange={(e)=> setFormInferencia({ ...formInferencia, modeloId: e.target.value})}
        />
      </StandardInput>
      <StandardInput label="Versão do Modelo">
        <Form.Control
          value={formInferencia.modeloVersao}
          onChange={(e)=> setFormInferencia({ ...formInferencia, modeloVersao: e.target.value})}
        />
      </StandardInput>
      <StandardInput label="Confiança média" unidade="%">
        <Form.Control
          type="number"
          value={formInferencia.confiancaMedia}
          onChange={(e)=> setFormInferencia({ ...formInferencia, confiancaMedia: e.target.value })}
        />
      </StandardInput>
      <div>TODO RESULTADOS</div>
      <div>TODO AGENTE</div>
    </>
  );
}
