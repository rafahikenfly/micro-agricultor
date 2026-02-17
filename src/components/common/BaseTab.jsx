import { Col, Form, Row } from "react-bootstrap";
import { StandardInput, StandardCard, timestampToString } from "../../utils/formUtils";

export default function BaseTab({ form, setForm, children }) {

  return (
    <>
        <StandardCard header="Descrição">
            <StandardInput label="Nome">
                <Form.Control
                  value={form.nome}
                  onChange={e => setForm({...form, nome: e.target.value})}
                  required
                />
            </StandardInput>
            <StandardInput label = "Descrição" stacked>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={form.descricao}
                  onChange={e => setForm({...form, descricao: e.target.value})}
                />
            </StandardInput>
            {children}
        </StandardCard>
        <StandardCard header="Auditoria">
            <StandardInput label="Criado em">
                <Row>
                    <Col><Form.Text>{timestampToString(form.createdAt) ?? "-"}</Form.Text></Col>
                    <Col><Form.Text>{form.createdBy?.nome ?? "-"}</Form.Text></Col>
                </Row>
            </StandardInput>
            {form.updatedAt && <StandardInput label="Atualizado em">
                <Row>
                    <Col><Form.Text>{timestampToString(form.updatedAt) || "-"}</Form.Text></Col>
                    <Col><Form.Text>{form.updatedBy.nome || "-"}</Form.Text></Col>
                </Row>
            </StandardInput>}
            {form.deletedAt && <StandardInput label="Apagado em">
                <Row>
                    <Col><Form.Text>{timestampToString(form.deletedAt) || "-"}</Form.Text></Col>
                    <Col><Form.Text>{form.deletedBy.nome || "-"}</Form.Text></Col>
                </Row>
            </StandardInput>}
            <StandardInput label="Versão">
                <Row>
                    <Col><Form.Text>{form.version ?? "-"}</Form.Text></Col>
                </Row>
            </StandardInput>
        </StandardCard>
    </>
  )
}