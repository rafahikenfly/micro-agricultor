import { useState, useEffect } from "react";
import { Modal, Form, Button, Card, InputGroup, Row, Col, Tabs, Tab } from "react-bootstrap";
import { validarCaracteristica } from "@domain/estados.rules";

import { TIPOS_ENTIDADE } from "../../../utils/consts/TIPOS_ENTIDADE"; //TODO: mudar para TYPES
import { VARIANTS } from "../../../utils/consts/VARIANTS";
import { handleSaveForm, StandardCheckboxGroup, StandardCard, StandardInput, renderOptions } from "../../../utils/formUtils";
import BaseTab from "../../../components/common/BaseTab";


export default function CaracteristicaModal({ show, onSave, onClose, data = {}, }) {
  // Controle de tab
  const [tab, setTab] = useState("dados");
  // Formulário
  const [form, setForm] = useState(validarCaracteristica(data))

  // Sanitiza data
  useEffect(() => { setForm(validarCaracteristica(data ?? {})); }, [data]);

  if (!show) return null;
  return (
    <Modal show onHide={onClose} size="lg">
      <Form onSubmit={(evt)=>handleSaveForm({
          evt,
          onSave,
          form,
          clear: true,
          onClear: ()=>setForm(validarCaracteristica({})),
          clearCache: "caracteristicas",
        })}>
        <Modal.Header closeButton>
          <Modal.Title>{data ? "Editar Característica" : "Nova Característica"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Tabs
            activeKey={tab}
            onSelect={(k) => k && setTab(k)}
            className="mb-3"
          >
            <Tab eventKey="dados" title="Característica">
              <BaseTab
                form={form}
                setForm={setForm}
              >
                <StandardCheckboxGroup label="Aplicável a:">
                  {TIPOS_ENTIDADE.map((tipo) => (
                    <Form.Check
                      key={tipo.id}
                      type="checkbox"
                      label={tipo.nome}
                      checked={!!form.aplicavel?.[tipo.id]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          aplicavel: {
                            ...form.aplicavel,
                            [tipo.id]: e.target.checked
                          }
                        })
                      }
                    />
                  ))}
                </StandardCheckboxGroup>
                <StandardInput label="Cor da tag">
                  <Form.Select
                    value={form.tagVariant}
                    onChange={e => setForm({...form, tagVariant: e.target.value})}
                    required
                  >
                    {renderOptions({
                      list: VARIANTS,
                      placeholder: "Selecione a cor da tag",
                    })}
                  </Form.Select>
                </StandardInput>
              </BaseTab>
            </Tab>
            <Tab eventKey="evolucao" title="Evolução">
              <StandardCard header="Confiança da informação">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <Card.Subtitle className="text-muted small">
                      Modelo de obsolescência e validade da medida
                    </Card.Subtitle>
                  </div>
                  <div>
                    <Form.Check
                      type="switch"
                      label="Aplicar obsolescência da informação"
                      className="ms-3"
                      checked={!!form.aplicarObsolescencia}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          aplicarObsolescencia: e.target.checked
                        })
                      }
                    />
                  </div>
                </div>
                <StandardInput
                  label="Longevidade da informação"
                  unidade="dias"
                  info="Tempo em que a confiança de uma informação se reduz de 100% para 20%."
                >
                  <Form.Control
                    type="number"
                    value={form.longevidade}
                    disabled={!form.aplicarObsolescencia}
                    onChange={e => setForm({...form, longevidade: Number(e.target.value)})}
                  />
                </StandardInput>
              </StandardCard>
              <StandardCard header="Valor Físico">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <Card.Subtitle className="text-muted small">
                      Comportamento e variação da grandeza
                    </Card.Subtitle>
                  </div>
                  <div>
                    <Form.Check
                      type="switch"
                      label="Aplicar variação com tempo"
                      className="ms-3"
                      checked={!!form.aplicarVariacao}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          aplicarVariacao: e.target.checked
                        })
                      }
                    />
                  </div>
                </div>
              <StandardInput label="Unidade">
                <Form.Control
                  value={form.unidade}
                  onChange={e => setForm({...form, unidade: e.target.value})}
                />
              </StandardInput>
              <StandardInput label="Faixa de valor">
                <Form.Control
                  type="number"
                  value={form.min}
                  onChange={e => setForm({...form, min: Number(e.target.value)})}
                />
                <Form.Control
                  type="number"
                  value={form.max}
                  onChange={e => setForm({...form, max: Number(e.target.value)})}
                />
              </StandardInput>
              <StandardInput label="Variação esperada" unidade="/dia">
              <Form.Control
                type="number"
                value={form.variacaoDiaria}
                disabled={!form.aplicarVariacao}
                onChange={e => setForm({...form, variacaoDiaria: Number(e.target.value)})}
              />
              </StandardInput>
              </StandardCard>
            </Tab>
            <Tab eventKey="configuracoes" title="Outras configurações">
              <StandardInput label="Resolução">
                <Form.Control
                  type="number"
                  value={form.resolucao}
                  onChange={e => setForm({...form, resolucao: Number(e.target.value)})}
                />
                </StandardInput>
                <StandardInput label="Dimensões">
                <Form.Control
                  type="number"
                  value={form.dimensoes}
                  onChange={e => setForm({...form, dimensoes: Number(e.target.value)})}
                />
              </StandardInput>
            </Tab>
          </Tabs>
        </Modal.Body>
          
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="success" type="submit">Salvar</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}