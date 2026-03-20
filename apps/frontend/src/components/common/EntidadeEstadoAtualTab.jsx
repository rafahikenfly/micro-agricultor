import { Badge, Col, Form, Row, } from "react-bootstrap";
import { StandardBadgeGroup, StandardCard, StandardInput } from "../../utils/formUtils";
import { unixToReadableString } from "../../utils/dateUtils";

export function EntidadeEstadoAtualTab ({formEstadoAtual, setFormEstadoAtual, caracteristicas, tipoEntidadeId}) {
  if (!formEstadoAtual) return null;

  const caracteristicasComEstadoAtual = new Set( Object.keys(formEstadoAtual) );

  const caracteristicasAplicaveisSemEstadoAtual = (caracteristicas ?? [])
  .filter(c =>
    c.aplicavel?.[tipoEntidadeId] === true &&
    !caracteristicasComEstadoAtual.has(c.id)
  )

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
        const caracteristica = caracteristicas?.find(
          c => c.id === caracteristicaId
        );

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
                <Row>
                    <Col><Form.Text>{estado.eventos ?? "-"}</Form.Text></Col>
                </Row>
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