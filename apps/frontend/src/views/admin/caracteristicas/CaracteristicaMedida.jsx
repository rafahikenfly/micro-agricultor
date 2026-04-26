import { Form } from "react-bootstrap"
import { StandardCard, StandardInput } from "../../../utils/formUtils"
import VetorTab from "../../../components/common/VetorTab";

export default function CaracteristicaMedida ({form, setForm}) {
  const obsolescencia = form.obsolescencia;
  const setObsolescencia = (value, key) =>
    setForm({
      ...form,
      obsolescencia: {
        ...form.obsolescencia,
        [key]: value
      }
    })
  const variacao = form.variacao;
  const setVariacao = (value, key) =>
    setForm({
      ...form,
      variacao: {
        ...form.variacao,
        [key]: value
      }
    })
  const medida = form.medida;
  const setMedida = (value, key) =>
    setForm({
      ...form,
      medida: {
        ...form.medida,
        [key]: value
      }
    })
  const resolucao = form.resolucao;
  const setResolucao = (value, key) =>
    setForm({
      ...form,
      resolucao: {
        ...form.resolucao,
        [key]: value
      }
    })

return ( <>
    <StandardCard
      header="Obsolescência"
      headerRight={
          <Form.Check
            type="switch"
            label="Aplicar obsolescência"
            className="ms-3"
            checked={!!obsolescencia.ativo}
            onChange={(e) => setObsolescencia(e.target.checked, "ativo")}
          />
      }>
      <StandardInput
        label="Longevidade"
        unidade="dias"
        info="Tempo em que a confiança de uma informação se reduz de 100% para 20%."
      >
        <Form.Control
          type="number"
          value={obsolescencia.longevidade}
          disabled={!obsolescencia.ativo}
          onChange={(e) => setObsolescencia(Number(e.target.value), "longevidade")}
        />
      </StandardInput>
    </StandardCard>
    <StandardCard
      header="Variação prevista"
      headerRight={
        <Form.Check
          type="switch"
          label="Aplicar variação com tempo"
          className="ms-3"
          checked={!!variacao.ativo}
          onChange={(e) => setVariacao(e.target.checked, "ativo") }
        />
      }
    >
      <StandardInput label="Variação esperada" unidade="/dia">
        <Form.Control
          type="number"
          value={variacao.valor}
          disabled={!variacao.ativo}
          onChange={e => setVariacao(Number(e.target.value), "valor")}
        />
      </StandardInput>
    </StandardCard>
    <StandardCard header="Medida">
      <StandardInput label="Unidade">
        <Form.Control
          value={medida.unidade}
          onChange={e => setMedida(e.target.value, "unidade")}
        />
      </StandardInput>
      <StandardInput label="Faixa de valor">
        <Form.Control
          type="number"
          value={medida.min}
          onChange={e => setMedida(Number(e.target.value), "min")}
        />
        <Form.Control
          type="number"
          value={medida.max}
          onChange={e => setMedida(Number(e.target.value), "max")}
        />
      </StandardInput>
    </StandardCard>
    <StandardCard header="Resolução">
      <StandardInput
        label="Variação significativa"
        unidade={medida.unidade}
      >
        <Form.Control
          value={resolucao.valor}
          onChange={e => setResolucao(Number(e.target.value), "valor")}
        />
      </StandardInput>
      <VetorTab
        formVetor={resolucao}
        setForm={setResolucao}
      />
    </StandardCard>
  </>)
}