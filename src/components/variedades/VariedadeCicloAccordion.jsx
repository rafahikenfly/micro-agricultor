import { useEffect, useState } from "react";
import { Form, InputGroup, Tabs, Tab } from "react-bootstrap";
import { Accordion } from "react-bootstrap";
import { validarCiclo } from "@domain/planta.rules";
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
            ...(replace ? {} : item[key]?.regras || {}),
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
  console.log("form", form)
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
                    placeholder="X"
                    value={form[idx]?.dimensao?.x ?? 0}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      const novoCiclo = data.map((item, i) => {
                        if (i !== idx) return item;
                        return {
                          ...item,
                          dimensao: {
                            ...(item.dimensao || {}),
                            x: value,
                          }
                        };
                      });

                      onChange(novoCiclo);
                    }}
                  />
                </InputGroup>

                <InputGroup>
                  <InputGroup.Text>Y</InputGroup.Text>
                  <Form.Control
                    placeholder="Y"
                    value={form[idx]?.dimensao?.y ?? 0}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      const novoCiclo = data.map((item, i) => {
                        if (i !== idx) return item;
                        return {
                          ...item,
                          dimensao: {
                            ...(item.dimensao || {}),
                            y: value,
                          }
                        };
                      });

                      onChange(novoCiclo);
                    }}
                  />
                </InputGroup>

                <InputGroup>
                  <InputGroup.Text>Z</InputGroup.Text>
                  <Form.Control
                    placeholder="Z"
                    value={form[idx]?.dimensao?.z ?? 0}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      const novoCiclo = data.map((item, i) => {
                        if (i !== idx) return item;
                        return {
                          ...item,
                          dimensao: {
                            ...(item.dimensao || {}),
                            z: value,
                          }
                        };
                      });

                      onChange(novoCiclo);
                    }}
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