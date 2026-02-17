import { Form } from "react-bootstrap";
import { StandardCard, StandardInput } from "../../utils/formUtils";

export default function HortaPosicaoTab ({formPosicao, setFormPosicao}) {
  return (
    <>
      <StandardCard header="Localização">
        <StandardInput label="Latitude" unidade="graus">
          <Form.Control
            value={formPosicao.lat}
            onChange={e => setFormPosicao({...formPosicao, lat: Number(e.target.value) }) }
          />
        </StandardInput>
        <StandardInput label="Longitude" unidade="graus">
          <Form.Control
            value={formPosicao.long}
            onChange={e => setFormPosicao({...formPosicao, long: Number(e.target.value) }) }
          />
        </StandardInput>
      </StandardCard>
      <StandardCard header="Posição">
        <StandardInput label="Altitude" unidade="m">
          <Form.Control
            value={formPosicao.altitude}
            onChange={e => setFormPosicao({...formPosicao, altitude: Number(e.target.value) }) }
          />
        </StandardInput>
        <StandardInput label="Orientação" unidade="graus">
          <Form.Control
            value={formPosicao.orientacao}
            onChange={e => setFormPosicao({...formPosicao, orientacao: Number(e.target.value) }) }
          />
        </StandardInput>
      </StandardCard>
    </>
  )
}