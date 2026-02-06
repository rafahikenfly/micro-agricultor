import { useEffect, useState } from "react";
import { Form, InputGroup, Tabs, Tab } from "react-bootstrap";
import { Accordion } from "react-bootstrap";
import { validarCiclo } from "../../domain/planta.rules";
import RegrasAmbienteTab from "./RegrasAmbienteTab";
import RegrasTarefasTab from "./RegrasTarefasTab";
import RegrasTransicoesTab from "./RegrasTransicoesTab";

export default function VariedadeCicloAccordion({
  data,
  caracteristicas = [],
  manejos = [],
  loading,
  onChange = ()=>{},
}) {
  if (!data) return null

  useEffect(() => {
    setForm(data);
  }, [data]);

  const [form, setForm] = useState(validarCiclo(data));    

  const atualizarRegrasObj = (key, payload, idxCiclo, replace = false) => {
    const novoCiclo = data.map((item, i) => {
      if (i !== idxCiclo) return item;

      return {
        ...item,
        [key]: {
          ...item[key],
          regras: {
            ...(replace ? {} : item[key].regras || {}),
            ...payload,
          }
        }
      };
    });

    onChange(novoCiclo);
  };
  const atualizarRegrasArr = (key, payload, idxCiclo) => {
    const novoCiclo = data.map((item, i) => {
      if (i !== idxCiclo) return item;
      return {
        ...item,
        [key]: {
          ...item[key],
          regras: payload,
        }
      };
    });
    onChange(novoCiclo);
  };

  const removerCaracteristica = (data) => {
    const {[data.caracteristicaId]: removed, ...novoObjCaracteristicas} = form.caracteristicas;
    onChange({...form, caracteristicas: novoObjCaracteristicas}, index);
  }

  return (
    <Accordion defaultActiveKey={null} className="mt-3">
      {data.map((f, idx) => (
        <Accordion.Item eventKey={`estagio-${idx}`} key={`estagio-${idx}`}>
          <Accordion.Header>
            {f.estagioNome}
          </Accordion.Header>
          <Accordion.Body>
            {/* Dimensão */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Dimensões da planta nesse estágio (cm)</Form.Label>

              <div className="d-flex gap-3">

                <InputGroup>
                  <InputGroup.Text>X</InputGroup.Text>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    value={form[idx]?.dimensao?.x ?? 0}
                    onChange={(e) =>
                      setForm(
                        {
                          ...form[idx],
                          dimensao: {
                            ...form[idx].dimensao,
                            x: Number(e.target.value)
                          }
                        },
                        "estagio"
                      )
                    }
                  />
                </InputGroup>

                <InputGroup>
                  <InputGroup.Text>Y</InputGroup.Text>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    value={form[idx]?.dimensao?.y ?? 0}
                    onChange={(e) =>
                      setForm(
                        {
                          ...form[idx],
                          dimensao: {
                            ...form[idx].dimensao,
                            y: Number(e.target.value)
                          }
                        },
                        "estagio"
                      )
                    }
                  />
                </InputGroup>

                <InputGroup>
                  <InputGroup.Text>Z</InputGroup.Text>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    value={form[idx]?.dimensao?.z ?? 0}
                    onChange={(e) =>
                      setForm(
                        {
                          ...form[idx],
                          dimensao: {
                            ...form[idx].dimensao,
                            z: Number(e.target.value)
                          }
                        },
                        "estagio"
                      )
                    }
                  />
                </InputGroup>

              </div>
            </Form.Group>
            <Tabs
              defaultActiveKey="ambiente"
              className="mb-3"
              mountOnEnter
              unmountOnExit
            >
              <Tab eventKey="ambiente" title="Ambiente">
                <RegrasAmbienteTab
                  data={data[idx]?.ambiente || {}}
                  idx={idx}
                  onChange={atualizarRegrasObj}
                  caracteristicas={caracteristicas.filter((a) => a.aplicavel.canteiro || a.aplicavel.horta)}
                  loading={loading}
                />
              </Tab>

              <Tab eventKey="tarefas" title="Tarefas">
                <RegrasTarefasTab
                  data={data[idx]?.tarefas || {}}
                  idx={idx}
                  onChange={atualizarRegrasArr}
                  caracteristicas={caracteristicas.filter((a) => a.aplicavel.planta)}
                  manejos={manejos.filter((a) => a.aplicavel.planta)}
                  loading={loading}
                />
              </Tab>

              <Tab eventKey="transicoes" title="Transições">
                <RegrasTransicoesTab
                  data={data[idx]?.transicoes || {}}
                  idx={idx}
                  onChange={atualizarRegrasArr}
                  caracteristicas={caracteristicas.filter((a) => a.aplicavel.planta)}
                  loading={loading}
                />
              </Tab>
            </Tabs>
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  )
}