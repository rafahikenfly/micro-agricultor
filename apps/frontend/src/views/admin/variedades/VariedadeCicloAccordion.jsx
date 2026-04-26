import { Accordion, Tabs, Tab } from "react-bootstrap";

import RegrasAmbienteTab from "./RegrasAmbienteTab";
import RegrasTarefasTab from "./RegrasTarefasTab";
import RegrasTransicaoTab from "./RegrasTransicaoTab";
import VetorTab from "../../../components/common/VetorTab";
import { useCache } from "../../../hooks/useCache";

export default function VariedadeCicloAccordion({ formCiclo, setFormCiclo, especieId }) {
  const { cacheEstagiosEspecie, cacheEspecies, reading } = useCache([
    "especies",
    "estagiosEspecie",
  ]);
  if (!especieId) return null
  if (!formCiclo) return null
  const cicloEspecie = cacheEspecies?.map.get(especieId)?.ciclo
  if (!cicloEspecie) return null

  return (
    <Accordion defaultActiveKey={null} className="mt-3">
      {cicloEspecie.map((faseEspecie, idx) => {
        const estagioNome = cacheEstagiosEspecie?.map.get(faseEspecie.estagioId)?.nome ?? "-";
        const faseVariedade = formCiclo[idx] ?? {};
        const setFaseVariedade = (faseVariedade) => setFormCiclo(
          formCiclo.map((item, i) => (i === idx ? faseVariedade : item))
        );

        // Consolida tamanho do ciclo da variedade
        while (formCiclo.length <= idx) { formCiclo.push({}); }
        // TODO: Cortar o array se for maior!      

        return (
        <Accordion.Item eventKey={`fase-${idx}`} key={`fase-${idx}`}>
          <Accordion.Header>{estagioNome}</Accordion.Header>
          <Accordion.Body>
            <VetorTab 
              header={`Dimensão mínima de ${estagioNome}`}
              formVetor = {faseVariedade?.dimensao ?? {}}
              setVetor = {(dimensao) => setFaseVariedade({...faseVariedade, dimensao}) }
            />
            <Tabs
              defaultActiveKey="ambiente"
              className="mb-3"
            >
              <Tab eventKey="ambiente" title="Ambiente">
                <RegrasAmbienteTab
                  header={`Condições ambientais ideais de ${estagioNome}`}
                  formAmbiente={faseVariedade?.ambiente ?? {}}
                  setFormAmbiente={(ambiente)=>setFaseVariedade({...faseVariedade, ambiente}) }
                />
              </Tab>

              <Tab eventKey="tarefas" title="Tarefas">
                <RegrasTarefasTab
                  header={`Tarefas de manejo de ${estagioNome}`}
                  formTarefas={faseVariedade?.tarefas ?? []}
                  setFormTarefas={(tarefas)=>setFaseVariedade({...faseVariedade, tarefas}) }
                />
              </Tab>

              <Tab eventKey="transicoes" title="Transição">
                <RegrasTransicaoTab
                  formTransicao={faseVariedade?.transicao ?? []}
                  setFormTransicao={(transicao)=>setFaseVariedade({...faseVariedade, transicao}) }
                />
              </Tab>
            </Tabs>
          </Accordion.Body>
        </Accordion.Item>
      )})}
    </Accordion>
  )
}