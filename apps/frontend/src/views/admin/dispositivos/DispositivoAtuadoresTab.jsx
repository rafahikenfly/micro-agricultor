import { useState } from "react"
import { renderOptions, StandardArrayInput, StandardCheckboxGroup, StandardInput } from "../../../utils/formUtils"
import { SENSOR } from "micro-agricultor/types/SENSOR"
import { Form } from "react-bootstrap"
import { useCache } from "../../../hooks/useCache"
import { ATUADOR, ENTIDADE, MACRO } from "micro-agricultor"

export const DispositivosAtuadoresTab = ({formAtuadores, setFormAtuadores}) => {
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
        form={formAtuadores}
        setForm={setFormAtuadores}
        inputLabel="Incluir atuador"
        inputData={form}
        colunas={[
          {rotulo: "Rótulo", dataKey: "label", },
          {rotulo: "Tipo de Atuador", dataKey: "tipoAtuadorId", render: (a)=>ATUADOR[a.tipoAtuadorId]?.nome ?? `id: ${a.tipoSensorId}`},
          {rotulo: "Ativo", dataKey: "ativo", render: (a)=> a.ativo ? "Sim" : "Não"},
          {rotulo: "Ação", dataKey: "contextMenuLabel", },
          {rotulo: "Macro", dataKey: "macroId", },
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
        {// TODO: MUDAR ISSO PARA UM ARRAY DE SELEÇÃO QUE PERMITA SELECIONAR DIVERSOS TIPOS DE ALVO
        }
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
      <StandardInput label="Atuador">
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