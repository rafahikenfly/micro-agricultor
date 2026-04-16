import { useEffect, useState } from "react"
import { Button, Form, Modal } from "react-bootstrap"
import { StandardCard, StandardInput } from "../../../utils/formUtils"
import { eventosService, mutacoesService } from "../../../services/historyService"
import { necessidadesService, tarefasService, entidadesService } from "../../../services/crudService"
import { useCalendarioEngine } from "../CalendarioEngine"
import { useToast } from "../../../services/toast/toastProvider"
import { useAuth } from "../../../services/auth/authContext"
import { toDateTimeLocal } from "../../../utils/dateUtils"
import { ENTIDADE } from "micro-agricultor"
import { useCache } from "../../../hooks/useCache"

const processarManejo = () => {console.warn("UNDER REVIEW")};

export const MonitorarModal = ({show, data, onClose}) => {
  if (!show) return null

  const { toastMessage } = useToast();
  const { user } = useAuth();
    const { cacheCaracteristicas, cacheCanteiros, cachePlantas, reading } = useCache([
      "caracteristicas",
      "canteiros",
      "plantas",
    ])
  
  const engine = useCalendarioEngine();

  const [stringTimestamp, setStringTimestamp] = useState(toDateTimeLocal(new Date()));
  
  const [form, setForm] = useState({})
  const [caracteristica, setCaracteristica] = useState({})
  const [writing, setWriting] = useState(false)
  
  // Constroi os dados do formulário
  useEffect(()=>{
    const formData = {}
    for (const entidadeId of (data.contexto.entidadesId ?? [])) {
      formData[entidadeId] = {
        [data.contexto.caracteristicaId]: {
          valor: 0,
          confianca: 100,
        }
      }
    }
    setForm(formData)
  },[data])

  useEffect(()=>{
    const caracteristicaMonitorada = 
      cacheCaracteristicas?.map.get(data?.contexto?.caracteristicaId)
    setCaracteristica(caracteristicaMonitorada)
  }, [data])  

  const entityMap = {
    [ENTIDADE.canteiro.id]: cacheCanteiros?.map,
    [ENTIDADE.planta.id]: cachePlantas?.map,
  }

  const monitorar = async (evt) => {    
    evt.preventDefault()
    
    // Recupera o timestamp
    const date = new Date(stringTimestamp);
    const timestamp = date.getTime();

    // Recupera as medidas, devolvendo o objeto {[entidadeId]: {[caracteristicaId]: {valor, confianca}}}
    const medidas =
    //Filtrar apenas os objetos (elimina eventuais campos de dados globais do form)
      Object.fromEntries(Object.entries(form)
        .filter(([_, v]) => typeof v === "object" && v !== null)
        .map(([entidadeId, caracteristicas]) => [
          entidadeId,
          //Filtrar apenas as entidades marcadas com monitorar
          Object.fromEntries(Object.entries(caracteristicas)
              .filter(([_, dados]) => dados?.monitorar === true)
              .map(([caracteristicaId, dados]) => [
                caracteristicaId,
                {
                  valor: dados.valor,
                  confianca: dados.confianca
                }
              ])
          )
        ])
        .filter(([_, caracteristicas]) => Object.keys(caracteristicas).length > 0)
      );

    // Verifica se há alguma medida para atualizar
    if (Object.keys(medidas).length === 0) {
      toastMessage({
        body: "Selecione ao menos uma característica para atualizar.",
        variant: VARIANT_TYPES.YELLOW});
      return;
    }


    // Recupera o tipoEntidadeID
    const tipoEntidadeId = data.contexto.tipoEntidadeId
    if (!tipoEntidadeId) {
      toastMessage({
        body: "Erro registrando o monitoramento",
        variant: VARIANT_TYPES.RED,
      })
      return;
    }

    // Monta o array de entidades
    const entidades = entityMap[tipoEntidadeId].filter(d => medidas?.[d.id]);

    // Processa os monitoramentos com user, tipoEntidadeId, entidades, medidas e timestamp
    setWriting(true);
    try {
      await processarMonitoramento({
        user,
        tipoEntidadeId,
        timestamp,
        medidas,
        entidades,
        services: {
          eventos: eventosService,
          entidade: entidadesService(data.contexto.tipoEntidadeId),
          historicoEfeitos: mutacoesService,
          necessidades: necessidadesService,
        }
      })
      //Conclui a tarefa
      concluirTarefa({
        tarefa: data,
        resolucao: {
          tipoResolucao: RESOLVE_TYPES.MONITOR,
          dataConclusao: timestamp,
          agente: { id: user.uid, tipo: SOURCE_TYPES.USER },
        },
        user,
        tarefasService,
      })
      //Fecha modal
        toastMessage({
          body: `Monitoramento de ${entidades.length > 1 ? `${entidades.length} ${data.contexto.tipoEntidadeId}s`: entidades[0].nome} registrado com sucesso.`,
          variant: VARIANT_TYPES.GREEN,
        });
      } catch (err) {
        console.error(err)
        toastMessage({
          body: `Erro ao registrar monitoramento.`,
          variant: VARIANT_TYPES.RED
        });
      } finally {
        setWriting(false);
        engine.setShowModalMonitorar(false);
      }
  }

  const tipoEntidadeId = data?.contexto?.tipoEntidadeId ?? null
  console.log("a",tipoEntidadeId)
  return (
    <Modal show={show} onHide={onClose}>
      <Form onSubmit={(evt)=>monitorar(evt)}>
      <Modal.Header closeButton>
        <Modal.Title>Monitorar {caracteristica?.nome}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <StandardInput label="Data/hora" width="120px">
          <Form.Control
            type="datetime-local"
            value={stringTimestamp}
            onChange={(e)=> setStringTimestamp(e.target.value)}
          />
        </StandardInput>

        {data?.contexto?.entidadesId?.map((entidadeId, i) => (
          <StandardCard
            key={entidadeId}
            header={tipoEntidadeId && entityMap?.[tipoEntidadeId] instanceof Map ? (entityMap?.[tipoEntidadeId]).get(entidadeId).nome : "-"}
            headerRight={
                <Form.Check
                  type="switch"
                  label="Atualizar"
                  className="mb-0"
                  checked={!!form[entidadeId]?.[caracteristica?.id]?.monitorar}
                  onChange={(e) => setForm({...form, [entidadeId]:
                    {...form[entidadeId], [caracteristica?.id]: {
                      ...(form[entidadeId]?.[caracteristica?.id] ?? {}),
                      monitorar: e.target.checked
                    }}}
                  )}
                />
            }
          >
          <StandardInput
            label="Valor"
            unidadeWidth="80px"
            unidade={reading ? "Carregando..."
            : caracteristica?.unidade ?? "Valor"}
          >
            <Form.Control
              type="number"
              min={caracteristica?.min ?? 0}
              max={caracteristica?.max ?? 1024}
              value={form[entidadeId]?.[caracteristica?.id]?.valor ?? ""}
              onChange={(e) => setForm({...form, [entidadeId]:
                {...form[entidadeId], [caracteristica.id]: {
                  ...(form[entidadeId]?.[caracteristica.id] ?? {}),
                  valor: Number(e.target.value)
                }}}
              )}
            />
          </StandardInput>
          <StandardInput
            label="Confiança"
            unidade="%"
            unidadeWidth="80px"
          >
            <Form.Control
              type="number"
              min="0"
              max="100"
              value={form[entidadeId]?.[caracteristica?.id]?.confianca ?? ""}
              onChange={(e) => setForm({...form, [entidadeId]:
                {...form[entidadeId], [caracteristica.id]: {
                  ...(form[entidadeId]?.[caracteristica.id] ?? {}),
                  confianca: Number(e.target.value)
                }}}
              )}
            />
          </StandardInput>
        </StandardCard>
        ))}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="success" type="submit">{writing ? "Monitorando..." : "Monitorar"}</Button>
      </Modal.Footer>
    </Form>
    </Modal>
  )
}