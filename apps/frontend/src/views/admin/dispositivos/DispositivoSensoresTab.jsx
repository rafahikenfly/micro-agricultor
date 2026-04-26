import { useState } from "react"
import { renderOptions, StandardArrayInput, StandardInput } from "../../../utils/formUtils"
import { SENSOR } from "micro-agricultor/types/SENSOR"
import { Form } from "react-bootstrap"
import { useCache } from "../../../hooks/useCache"
import { ENTIDADE } from "micro-agricultor"

export const DispositivosSensoresTab = ({formSensores, setFormSensores}) => {
  const { cacheCanteiros, cachePlantas, cacheCaracteristicas, reading } = useCache([
    "canteiros",
    "plantas",
    "caracteristicas"
  ]);
  const [form, setForm] = useState({
    tipoSensorId: "",
    tipoEntidadeId: "",
    entidadeId: "",
    pino: 0,
    confianca: 0,
    mudancaMinima: 0,
    intervaloLeitura: 0
  })

  const listaEntidades = {
    [ENTIDADE.planta.id]: cachePlantas?.list ?? [],
    [ENTIDADE.canteiro.id]: cacheCanteiros?.list ?? [],
  }
    
  return (
    <StandardArrayInput
        form={formSensores}
        setForm={setFormSensores}
        inputLabel="Incluir sensor"
        inputData={form}
        colunas={[
          {rotulo: "Entidade", dataKey: "entidadeId", render: (a)=>cacheCanteiros?.map.get(a.entidadeId)?.nome ?? `id: ${a.entidadeId}`},
          {rotulo: "Tipo", dataKey: "tipoSensorId", render: (a)=>SENSOR[a.tipoSensorId]?.nome ?? `id: ${a.tipoSensorId}`},
          {rotulo: "Caracteristica", dataKey: "caracteristicaId", render: (a)=>cacheCaracteristicas?.map.get(a.caracteristicaId)?.nome ?? `id: ${a.caracteristicaId}`},
          {rotulo: "Pino", dataKey: "pino",},
          {rotulo: "Mín", dataKey: "mudancaMinima",},
          {rotulo: "Hb(ms)", dataKey: "heartbeatMs",},
        ]}
    >
      <StandardInput label="Sensor/Pino/Confianca">
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
        <Form.Control
          type="number"
          value={form.confianca}
          onChange={e => setForm({...form, confianca: Number(e.target.value)})}
        />
      </StandardInput>
      <StandardInput label="Valor relevante/Intervalo Leitura">
        <Form.Control
          type="number"
          value={form.mudancaMinima}
          onChange={e => setForm({...form, mudancaMinima: Number(e.target.value)})}
        />
        <Form.Control
          type="number"
          value={form.intervaloLeitura}
          onChange={e => setForm({...form, intervaloLeitura: Number(e.target.value)})}
        />
      </StandardInput>
      <StandardInput label="Entidade">
        <Form.Select
          value={form.tipoEntidadeId ?? ""}
          onChange={e => setForm({...form, tipoEntidadeId: e.target.value})}
        >
          {renderOptions({
            list: Object.values(ENTIDADE),
            loading: reading,
            placeholder: "Selecione o tipo de entidade",
            nullOption: false,
            isOptionDisabled: (a) => !listaEntidades[a.id]
          })}
        </Form.Select>
        <Form.Select
          value={form.entidadeId ?? ""}
          onChange={e => setForm({...form, entidadeId: e.target.value})}
        >
          {renderOptions({
            list: listaEntidades[form.tipoEntidadeId],
            loading: reading,
            placeholder: "Selecione a entidade",
            nullOption: false,
          })}
        </Form.Select>
      </StandardInput>
      <StandardInput label="Confiança">
        <Form.Select
          value={form.caracteristicaId ?? ""}
          onChange={e => setForm({...form, caracteristicaId: e.target.value})}
        >
          {renderOptions({
            list: Object.values(cacheCaracteristicas?.list ?? []),
            placeholder: "Selecione a característica",
            nullOption: false,
          })}
        </Form.Select>
      </StandardInput>
    </StandardArrayInput>
  )
}