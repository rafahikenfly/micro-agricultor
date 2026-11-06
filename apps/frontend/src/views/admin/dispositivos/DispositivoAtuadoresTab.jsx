import { useState } from "react"
import { renderOptions, StandardArrayInput, StandardCheckboxGroup, StandardInput } from "../../../utils/formUtils"
import { SENSOR } from "micro-agricultor/types/SENSOR"
import { Form } from "react-bootstrap"
import { useCache } from "../../../hooks/useCache"
import { ATUADOR, ENTIDADE } from "micro-agricultor"

export const DispositivosAtuadoresTab = ({formAtuadores, setFormAtuadores}) => {
  const { cacheCaracteristicas, reading } = useCache([
    "canteiros",
    "plantas",
    "caracteristicas"
  ]);
  const [form, setForm] = useState({
    tipoAtuadorId: "",
    tipoEntidadeId: "",
    caracteristicaId: "",
    contextMenuLabel: "",
  })
    
  return (
    <StandardArrayInput
        form={formAtuadores}
        setForm={setFormAtuadores}
        inputLabel="Incluir atuador"
        inputData={form}
        colunas={[
          {rotulo: "Ação", dataKey: "contextMenuLabel", },
          {rotulo: "Ativo", dataKey: "ativo", },
          {rotulo: "Rótulo", dataKey: "label", },
          {rotulo: "Tipo de Atuador", dataKey: "tipoAtuadorId", render: (a)=>ATUADOR[a.tipoAtuadorId]?.nome ?? `id: ${a.tipoSensorId}`},
          {rotulo: "Tipo de Entidade", dataKey: "tipoEntidadeId", render: (a)=>ENTIDADE[a.tipoEntidadeId]?.nome ?? `id: ${a.tipoEntidadeId}`},
          {rotulo: "Caracteristica", dataKey: "caracteristicaId", render: (a)=>cacheCaracteristicas?.map.get(a.caracteristicaId)?.nome ?? `id: ${a.caracteristicaId}`},
        ]}
    >
      <StandardInput label="Tipo de Atuador">
        <Form.Select
          value={form.tipoAtuadorId ?? ""}
          onChange={e => setForm({...form, tipoAtuadorId: e.target.value})}
        >
          {renderOptions({
            list: Object.values(ATUADOR),
            placeholder: "Selecione tipo de atuador do dispositivo",
            nullOption: false,
          })}
        </Form.Select>
      </StandardInput>
      <StandardInput label="Tipo de Alvo">
        <Form.Select
          value={form.tipoEntidadeId ?? ""}
          onChange={e => setForm({...form, tipoEntidadeId: e.target.value})}
        >
          {renderOptions({
            list: Object.values(ENTIDADE),
            loading: reading,
            placeholder: "Selecione o tipo de entidade alvo do atuador",
            nullOption: false,
          })}
        </Form.Select>
      </StandardInput>
      <StandardInput label="Característica Afetada">
        <Form.Select
          value={form.caracteristicaId ?? ""}
          onChange={e => setForm({...form, caracteristicaId: e.target.value})}
        >
          {renderOptions({
            list: Object.values(cacheCaracteristicas?.list ?? []),
            placeholder: "Selecione a característica afetada pelo atuador",
            loading: reading,
            nullOption: false,
          })}
        </Form.Select>
      </StandardInput>
      <StandardInput label="Nome de ação de contexto">
        <Form.Control
          value={form.contextMenuLabel ?? ""}
          onChange={e => setForm({...form, contextMenuLabel: e.target.value})}
        />
      </StandardInput>
      <StandardInput label="Nome do atuador">
        <Form.Control
          value={form.label ?? ""}
          onChange={e => setForm({...form, label: e.target.value})}
        />
      </StandardInput>
      <StandardCheckboxGroup>
        <Form.Check
          type="checkbox"
          label="Ativo"
          checked={form.ativo ?? false}
          onChange={e => setForm({...form, ativo: e.target.checked})}
        />
      </StandardCheckboxGroup>
    </StandardArrayInput>
  )
}