import { useState } from "react"
import { renderOptions, StandardArrayInput, StandardInput } from "../../../utils/formUtils"
import { SENSOR } from "micro-agricultor/types/SENSOR"
import { Form } from "react-bootstrap"
import { useCache } from "../../../hooks/useCache"

export const DispositivosSensoresTab = ({formSensores, setFormSensores}) => {
  const { cacheCanteiros, cachePlantas, reading } = useCache([
    "canteiros",
    "plantas",
  ]);
  const [form, setForm] = useState({
    tipoSensorId: "",
    entidadeId: "",
    pino: "",
    mudancaMinima: 0,
    heartbeatMs: 0,
  })
    
  return (
    <StandardArrayInput
        form={formSensores}
        setForm={setFormSensores}
        header="Incluir sensor"
        headerData={form} //TODO
        colunas={[
          {rotulo: "Entidade", dataKey: "entidadeId", render: (id)=>cacheCanteiros?.map.get(id)?.nome ?? `id: ${id}`},
          {rotulo: "Tipo", dataKey: "tipoSensorId", render: (id)=>SENSOR[id]?.nome ?? `id: ${id}`},
          {rotulo: "Pino", dataKey: "pino",},
          {rotulo: "Mín", dataKey: "mudancaMinima",},
          {rotulo: "Hb(ms)", dataKey: "heartbeatMs",},
        ]}
    >
      <StandardInput label="Sensor/Pino">
        <Form.Select
          value={form.tipoSensorId ?? ""}
          onChange={e => setForm({...form, tipoSensorId: e.target.value})}
        >
          {renderOptions({
            list: Object.values(SENSOR),
            placeholder: "Selecione tipo de sensor",
            nullOption: false,
          })}
        </Form.Select>
        <Form.Control
          type="number"
          value={form.pino}
          onChange={e => setForm({...form, pino: Number(e.target.value)})}
        />
      </StandardInput>
      <StandardInput label="Valor relevante/heartbeat (ms)">
        <Form.Control
          type="number"
          value={form.mudancaMinima}
          onChange={e => setForm({...form, mudancaMinima: Number(e.target.value)})}
        />
        <Form.Control
          type="number"
          value={form.heartbeatMs}
          onChange={e => setForm({...form, heartbeatMs: Number(e.target.value)})}
        />
      </StandardInput>
      <StandardInput label="Entidade">
        <Form.Select
          value={form.entidadeId ?? ""}
          onChange={e => setForm({...form, entidadeId: e.target.value})}
        >
          {renderOptions({
            list: [...(cacheCanteiros?.list ?? []), ...(cachePlantas?.list ?? [])],
            loading: reading,
            placeholder: "Todo: pegar todas as entidades",
            nullOption: false,
          })}
        </Form.Select>
      </StandardInput>
    </StandardArrayInput>
  )
}