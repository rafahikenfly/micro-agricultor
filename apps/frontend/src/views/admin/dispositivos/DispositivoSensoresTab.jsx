import { useState } from "react"
import { renderOptions, StandardArrayInput, StandardCheckboxGroup, StandardInput } from "../../../utils/formUtils"
import { Form } from "react-bootstrap"
import { useCache } from "../../../hooks/useCache"
import { SENSOR, ENTIDADE, MACRO } from "micro-agricultor"
import { renderBadgeGroup } from "../../../utils/uiUtils"

export const DispositivosSensoresTab = ({formSensores, setFormSensores}) => {
  const { cacheCaracteristicas, reading } = useCache([
    "canteiros",
    "plantas",
    "caracteristicas"
  ]);
  const [form, setForm] = useState({
    ativo: false,
    caracteristicaId: "",
    contextMenuLabel: "",
    label: "",
    macroId: "",
    tipoAtuadorId: "",
    tipoEntidadeId: "",
  })
    
  return (
    <StandardArrayInput
        form={formSensores}
        setForm={setFormSensores}
        inputLabel="Incluir sensor"
        inputData={form}
        colunas={[
          {rotulo: "Nome", dataKey: "nome", },
          {rotulo: "Tipo de Atuador", dataKey: "tipoAtuadorId", render: (a)=>ATUADOR[a.tipoAtuadorId]?.nome ?? `id: ${a.tipoSensorId}`},
          {rotulo: "Ativo", dataKey: "ativo", render: (a)=> a.ativo ? "Sim" : "Não"},
          {rotulo: "Ação", dataKey: "contextMenuLabel", },
          {rotulo: "Macro", dataKey: "macroId", },
          {rotulo: "Aplicável à", dataKey: "aplicavel", render: (a)=>renderBadgeGroup(a, "aplicavel", ENTIDADE) },
          {rotulo: "Caracteristica", dataKey: "caracteristicaId", render: (a)=>cacheCaracteristicas?.map.get(a.caracteristicaId)?.nome ?? `id: ${a.caracteristicaId}`},
        ]}
    >
      <StandardInput label="Tipo de Sensor">
        <Form.Select
          value={form.tipoAtuadorId ?? ""}
          onChange={e => setForm({...form, tipoAtuadorId: e.target.value})}
        >
          {renderOptions({
            list: Object.values(SENSOR),
            placeholder: "Selecione tipo de sensor do dispositivo",
            nullOption: false,
          })}
        </Form.Select>
      </StandardInput>
      <StandardCheckboxGroup label="Opções">
        <Form.Check
          type="checkbox"
          label="Ativo"
          checked={form.ativo ?? false}
          onChange={e => setForm({...form, ativo: e.target.checked})}
        />
        <Form.Check
          type="checkbox"
          label="Usar troca"
          checked={form.usarTroca ?? false}
          onChange={e => setForm({...form, usarTroca: e.target.checked})}
        />
        <Form.Check
          type="checkbox"
          label="Usar parâmetros"
          checked={form.usarParametros ?? false}
          onChange={e => setForm({...form, usarParametros: e.target.checked})}
        />
      </StandardCheckboxGroup>
      <StandardCheckboxGroup label="Aplicável a">
        {Object.values(ENTIDADE).map(te => (
          <Form.Check
            key={te.id}
            label={te.nome}
            checked={form.aplicavel?.[te.id] === true ?? false}
            onChange={e => setForm({ ...form, aplicavel: { ...form.aplicavel, [te.id]: e.target.checked } })}
          />
        ))}
      </StandardCheckboxGroup>
      <StandardInput label="Característica Afetada">
        <Form.Select
          value={form.caracteristicaId ?? ""}
          onChange={e => setForm({...form, caracteristicaId: e.target.value})}
        >
          {renderOptions({
            list: Object.values(cacheCaracteristicas?.list ?? []),
            placeholder: "Selecione a característica inspecionada pelo sensor",
            loading: reading,
            nullOption: false,
          })}
        </Form.Select>
      </StandardInput>
      <StandardInput label="Ação">
        <Form.Control
          value={form.contextMenuLabel ?? ""}
          onChange={e => setForm({...form, contextMenuLabel: e.target.value})}
        />
        <Form.Select
          value={form.macroId ?? ""}
          onChange={e => setForm({...form, macroId: e.target.value})}
        >
          {renderOptions({
            list: Object.values(MACRO),
            loading: reading,
            placeholder: "Selecione a macro do atuador",
            nullOption: false,
          })}
        </Form.Select>
      </StandardInput>
      <StandardInput label="Nome">
        <Form.Control
          value={form.nome ?? ""}
          onChange={e => setForm({...form, nome: e.target.value})}
        />
      </StandardInput>
    </StandardArrayInput>
  )
}