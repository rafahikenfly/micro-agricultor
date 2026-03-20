import { Accordion, Tabs, Tab } from "react-bootstrap";

import RegrasAmbienteTab from "./RegrasAmbienteTab";
import RegrasTarefasTab from "./RegrasTarefasTab";
import RegrasTransicaoTab from "./RegrasTransicaoTab";
import VetorTab from "../../../components/common/VetorTab";

export default function VariedadeCicloAccordion({ formCiclo, caracteristicas = [], manejos = [], loading, setFormCiclo }) {
  if (!formCiclo) return null

  // Handlers
  const atualizarRegrasObj = (idxCiclo, regras, key) => {
    const novoCiclo = formCiclo.map((estagio, i) => {
      if (i !== idxCiclo) return estagio;
      return {
        ...estagio,
        [key]: { ...(estagio[key] ?? {}), ...regras }
      };
    });

    setFormCiclo(novoCiclo);
  }
  const atualizarRegrasArr = (idxCiclo, regras, key) => {
    const novoCiclo = formCiclo.map((estagio, i) => {
      if (i !== idxCiclo) return estagio;
      return {
        ...estagio,
        [key]: [ ...(estagio[key] ?? []), ...regras ]
      };
    });

    setFormCiclo(novoCiclo);
  }


  return (
    <Accordion defaultActiveKey={null} className="mt-3">
      {formCiclo.map((f, idx) => {
        //console.log(idx,f)
        return (
        <Accordion.Item eventKey={`estagio-${idx}`} key={`estagio-${idx}`}>
          <Accordion.Header>
            {f.estagioNome}
          </Accordion.Header>
          <Accordion.Body>
            <VetorTab 
              formVetor = {formCiclo[idx]?.dimensao ?? {}}
              setVetor = {(dimensao) => {
                const novoCiclo = formCiclo.map((item, i) => {
                  if (i !== idx) return item;
                  return { ...item, dimensao };
                });
                setFormCiclo(novoCiclo);
              }}
            />
            <Tabs
              defaultActiveKey="ambiente"
              className="mb-3"
              mountOnEnter
              unmountOnExit
            >
              <Tab eventKey="ambiente" title="Ambiente">
                <RegrasAmbienteTab
                  formAmbiente={formCiclo[idx]?.ambiente ?? {}}
                  idxCiclo={idx}
                  setFormAmbiente={(a,b)=>atualizarRegrasObj(a,b,"ambiente")}
                  caracteristicas={caracteristicas.filter((a) => a.aplicavel.canteiro || a.aplicavel.horta)}
                  loading={loading}
                />
              </Tab>

              <Tab eventKey="tarefas" title="Tarefas">
                <RegrasTarefasTab
                  formTarefas={formCiclo[idx]?.tarefas ?? []}
                  idxCiclo={idx}
                  setFormTarefas={(a,b)=>atualizarRegrasArr(a,b,"tarefas")}
                  caracteristicas={caracteristicas.filter((a) => a.aplicavel.planta)}
                  manejos={manejos.filter((a) => a.aplicavel.planta)}
                  loading={loading}
                />
              </Tab>

              <Tab eventKey="transicoes" title="Transições">
                <RegrasTransicaoTab
                  formTransicoes={formCiclo[idx]?.transicoes || {}}
                  idxCiclo={idx}
                  setFormTransicoes={(a,b)=>atualizarRegrasObj(a,b,"transicoes")}
                  caracteristicas={caracteristicas.filter((a) => a.aplicavel.planta)}
                  loading={loading}
                />
              </Tab>
            </Tabs>
          </Accordion.Body>
        </Accordion.Item>
      )})}
    </Accordion>
  )
}


/**
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
                      const novoCiclo = formCiclo.map((item, i) => {
                        if (i !== idx) return item;
                        return {
                          ...item,
                          dimensao: {
                            ...(item.dimensao || {}),
                            x: value,
                          }
                        };
                      });

                      setFormCiclo(novoCiclo);
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
                      const novoCiclo = formCiclo.map((item, i) => {
                        if (i !== idx) return item;
                        return {
                          ...item,
                          dimensao: {
                            ...(item.dimensao || {}),
                            y: value,
                          }
                        };
                      });

                      setFormCiclo(novoCiclo);
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
                      const novoCiclo = formCiclo.map((item, i) => {
                        if (i !== idx) return item;
                        return {
                          ...item,
                          dimensao: {
                            ...(item.dimensao || {}),
                            z: value,
                          }
                        };
                      });

                      setFormCiclo(novoCiclo);
                    }}
                  />
                  </InputGroup>

              </div>
            </Form.Group>
 */