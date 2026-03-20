import { Form } from "react-bootstrap"
import { StandardCard, StandardInput } from "../../../utils/formUtils"

export const MidiaMetadadosTab = ({formMetadados, setFormMetadados}) => {
  return (
    <>
    <StandardCard header="Tamanho">
      <StandardInput label = "Bytes">
        <Form.Control
          type="number"
          step="1"
          value={formMetadados.bytes}
          onChange={(e)=>setFormMetadados({...formMetadados, bytes: Number(e.target.value)})}
        />
      </StandardInput>
      <StandardInput label = "Altura">
        <Form.Control
          type="number"
          step="1"
          value={formMetadados.altura}
          onChange={(e)=>setFormMetadados({...formMetadados, altura: Number(e.target.value)})}
        />
      </StandardInput>
      <StandardInput label = "Largura">
        <Form.Control
          type="number"
          step="1"
          value={formMetadados.largura}
          onChange={(e)=>setFormMetadados({...formMetadados, largura: Number(e.target.value)})}
        />
      </StandardInput>
    </StandardCard>
    <StandardCard header="Armazenagem">
      <StandardInput label = "URL">
        <Form.Control
          value={formMetadados.url}
          onChange={(e)=>setFormMetadados({...formMetadados, url: e.target.value})}
        />
      </StandardInput>
      <StandardInput label = "Storage Path">
        <Form.Control
          value={formMetadados.storagePath}
          onChange={(e)=>setFormMetadados({...formMetadados, storagePath: e.target.value})}
        />
      </StandardInput>
    </StandardCard>
    </>
  )
}