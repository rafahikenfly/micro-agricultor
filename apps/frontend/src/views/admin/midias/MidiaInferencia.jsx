import { Accordion, Form, } from "react-bootstrap";
import { StandardCard, StandardInput } from "../../../utils/formUtils";
import { useCache } from "../../../hooks/useCache";
import Loading from "../../../components/Loading";


export default function MidiaInferencia({ formInferencia, setFormInferencia }) {

  const { cacheModelosCV, reading } = useCache(["modelosCV"])
  if (!formInferencia) return <>Visão computacional não concluída</>
  if (reading) return <Loading />
  return (
    <>
      {Object.entries(formInferencia.resultados).map(([modelId,result])=>(
        <StandardCard header={cacheModelosCV?.map.get(modelId)?.nome ?? modelId}>
          {Object.entries(result).map(([classeId,detections])=>(
            <StandardInput label={classeId}>
              <Form.Control
                value={detections.count}
                disabled
              />
              <Form.Control
                value={`${(detections.confidence * 100).toFixed(2)}%`}
                disabled
              />
            </StandardInput>
          ))}
        </StandardCard>
      ))}
    </>
  );
}
