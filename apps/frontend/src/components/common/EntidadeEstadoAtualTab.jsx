import { Badge, Col, Form, Row, } from "react-bootstrap";
import { StandardArrayInput, StandardBadgeGroup, StandardCard, StandardInput } from "../../utils/formUtils";
import { unixToReadableString } from "../../utils/dateUtils";
import { useCache } from "../../hooks/useCache";
import Loading from "../Loading";
import { EVENTO } from "micro-agricultor";

export function EntidadeEstadoAtualTab ({formEstadoAtual, setFormEstadoAtual, tipoEntidadeId}) {
  const { cacheCaracteristicas, cacheEventos, reading} = useCache(["caracteristicas", "eventos"])

  if (reading) return <Loading />;
  if (!formEstadoAtual || !cacheCaracteristicas) return null;

  const caracteristicasComEstadoAtual = new Set( Object.keys(formEstadoAtual) );

  const caracteristicasAplicaveisSemEstadoAtual = cacheCaracteristicas.list
  .filter(c =>
    c.aplicavel?.[tipoEntidadeId] === true &&
    !caracteristicasComEstadoAtual.has(c.id)
  )

  if (reading) return <Loading />
  return (
    <>
      <StandardCard header="Sem informações">
        <StandardBadgeGroup>
          {caracteristicasAplicaveisSemEstadoAtual.map((c)=>
            <Badge
              key={c.id}
              bg={c.tagVariant}>
                {c.nome}
            </Badge>
          )}
        </StandardBadgeGroup>
      </StandardCard>
      {Object.entries(formEstadoAtual).map(([caracteristicaId, estado]) => {
        const caracteristica = cacheCaracteristicas.map.get(caracteristicaId);
        if (!caracteristica) return null;

        return (
          <StandardCard
            key={caracteristicaId}
            header={caracteristica.nome}
          >
            <Row>
              <Col>
              <StandardInput label="Calculado em" stacked>
                <Form.Text>{unixToReadableString(estado.calculadoEm) ?? "-"}</Form.Text>
              </StandardInput>
              </Col>
              <Col>
              <StandardInput label="Medida" stacked>
                <Form.Text>{estado.valor ?? "-"}</Form.Text>
              </StandardInput>
              </Col>
              <Col>
              <StandardInput label="Confianca" stacked>
                <Form.Text>
                  {estado.confianca != null
                  ? `${estado.confianca.toFixed(2)}%`
                  : "-"}
                </Form.Text>
              </StandardInput>
              </Col>
            </Row>
            <StandardInput label="Eventos desde o último monitoramento manual" stacked>
              <StandardArrayInput
                noHeader
                form={estado.eventos}
                colunas={[
                  {rotulo: "Tipo", dataKey: "tipoEventoId", render: (a)=>EVENTO[cacheEventos?.map.get(a)?.tipoEventoId]?.nome ?? "-"},
                  {rotulo: "Data/hora", dataKey: "tipoEventoId", render: (a)=>unixToReadableString(cacheEventos?.map.get(a)?.timestamp) ?? "-"}
                ]}
              />
            </StandardInput>
            <StandardInput label="Manejos desde o último monitoramento manual" stacked>
                <Row>
                    <Col><Form.Text>{estado.manejos ?? "-"}</Form.Text></Col>
                </Row>
            </StandardInput>
          </StandardCard>
        );
      })}
    </>
  )
}