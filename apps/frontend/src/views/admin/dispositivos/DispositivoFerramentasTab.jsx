import { useState } from "react"
import { renderOptions, StandardArrayInput, StandardCheckboxGroup, StandardInput } from "../../../utils/formUtils"
import { Form } from "react-bootstrap"
import { useCache } from "../../../hooks/useCache"
import { ATUADOR as FERRAMENTA, ENTIDADE, MACRO, EVENTO, EFEITO } from "micro-agricultor"
import { renderBadgeGroup } from "../../../utils/uiUtils"

export const DispositivosFerramentasTab = ({formFerramentas, setFormFerramentas}) => {
  const { cacheCaracteristicas, reading } = useCache([
    "canteiros",
    "plantas",
    "caracteristicas"
  ]);
  const [form, setForm] = useState({
    ativo: false,
    nome: "Nova ferramenta",
    tipoFerramentaId: "",
    tipoEventoId: EVENTO.MONITORAMENTO.id,
    indiceFerramenta: "",

    aplicavel: {},
    caracteristicaId: "",
    efeito: EFEITO.NENHUM.id,
    valor: 0,

    nomeAcao: "",
    macroId: "",
    parametros: {},
    indiceTroca: 0,
    
    usarTroca: false,
    usarMover: false,
    usarMacro: false,
    usarParametro: false,
    usarMenuContexto: false,
  })
    
  return (
    <StandardArrayInput
        form={formFerramentas}
        setForm={setFormFerramentas}
        inputLabel="Incluir ferramenta"
        inputData={form}
        colunas={[
          {rotulo: "Nome", dataKey: "nome", },
          {rotulo: "Tipo", dataKey: "tipoFerramentaId", render: (a)=>FERRAMENTA[a.tipoFerramentaId]?.nome ?? `id: ${a.tipoFerramentaId}`},
          {rotulo: "Evento", dataKey: "tipoEventoId", render: (a)=>EVENTO[a.tipoEventoId]?.nome ?? `id: ${a.tipoEventoId}`},
          {rotulo: "Ativo", dataKey: "ativo", render: (a)=> a.ativo ? "Sim" : "Não"},
          {rotulo: "Aplicável à", dataKey: "aplicavel", render: (a)=>renderBadgeGroup(a, "aplicavel", ENTIDADE) },
          {rotulo: "Caracteristica", dataKey: "caracteristicaId", render: (a)=>cacheCaracteristicas?.map.get(a.caracteristicaId)?.nome ?? `id: ${a.caracteristicaId}`},
          {rotulo: "Ação", dataKey: "nomeAcao", },
          {rotulo: "Macro", dataKey: "macroId", },
        ]}
    >
      <StandardInput label="Nome">
        <Form.Control
          value={form.nome ?? ""}
          onChange={e => setForm({...form, nome: e.target.value})}
        />
      </StandardInput>
      <StandardInput label="Tipo/Índice">
        <Form.Select
          value={form.tipoFerramentaId ?? ""}
          onChange={e => setForm({...form, tipoFerramentaId: e.target.value})}
        >
          {renderOptions({
            list: Object.values(FERRAMENTA),
            placeholder: "Selecione tipo de ferramenta",
            nullOption: false,
          })}
        </Form.Select>
        <Form.Control
          value={form.indiceFerramenta ?? ""}
          onChange={e => setForm({...form, indiceFerramenta: Number(e.target.value)})}
        />
      </StandardInput>
      <StandardInput label="Evento">
        <Form.Select
          value={form.tipoEventoId ?? ""}
          onChange={e => setForm({...form, tipoEventoId: e.target.value})}
        >
          {renderOptions({
            list: Object.values(EVENTO),
            placeholder: "Selecione tipo de evento da ferramenta",
            nullOption: false,
          })}
        </Form.Select> 
      </StandardInput>
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
      <StandardInput label="Efeito">
        <Form.Select
          value={form.caracteristicaId ?? ""}
          onChange={e => setForm({...form, caracteristicaId: e.target.value})}
        >
          {renderOptions({
            list: Object.values(cacheCaracteristicas?.list ?? []),
            placeholder: "Selecione a característica manejada pelo atuador",
            loading: reading,
            nullOption: false,
          })}
        </Form.Select>
        <Form.Select
          value={form.efeito ?? ""}
          onChange={e => setForm({...form, efeito: e.target.value})}
        >
          {renderOptions({
            list: Object.values(EFEITO) ?? [],
            placeholder: "Selecione o tipo de efeito da ferramenta",
            loading: reading,
            nullOption: false,
          })}
        </Form.Select>
        <Form.Control
          value={form.valor ?? ""}
          onChange={e => setForm({...form, valor: Number(e.target.value)})}
        />
      </StandardInput>
      <StandardInput label="Ação">
        <Form.Control
          value={form.nomeAcao ?? ""}
          onChange={e => setForm({...form, nomeAcao: e.target.value})}
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
          label="Mover antes"
          checked={form.usarMover ?? false}
          onChange={e => setForm({...form, usarMover: e.target.checked})}
        />
        <Form.Check
          type="checkbox"
          label="Usar macro"
          checked={form.usarMacro ?? false}
          onChange={e => setForm({...form, usarMacro: e.target.checked})}
        />
        <Form.Check
          type="checkbox"
          label="Usar parâmetros"
          checked={form.usarParametro ?? false}
          onChange={e => setForm({...form, usarParametro: e.target.checked})}
        />
      </StandardCheckboxGroup>
    </StandardArrayInput>
  )
}