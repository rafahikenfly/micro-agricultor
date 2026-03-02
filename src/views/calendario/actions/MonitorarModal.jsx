import { useEffect, useState } from "react"
import { Button, Form, Modal } from "react-bootstrap"
import { handleSaveForm, StandardCard, StandardInput } from "../../../utils/formUtils"
import { processarMonitoramento } from "../../../../shared/aplication/monitoramento"
import { eventosService } from "../../../services/history/eventosService"
import { historicoEfeitosService } from "../../../services/history/efeitosService"
import { ENTITY_TYPES } from "../../../../shared/types/ENTITY_TYPES"
import { canteirosService } from "../../../services/crud/canteirosService"
import { plantasService } from "../../../services/crud/plantasService"
import { VARIANT_TYPES } from "../../../../shared/types/VARIANT_TYPES"
import { useCalendarioEngine } from "../CalendarioEngine"
import { useToast } from "../../../services/toast/toastProvider"
import { useAuth } from "../../../services/auth/authContext"
import { concluirTarefa } from "../../../../shared/aplication/tarefas.application"
import { tarefasService } from "../../../services/crud/tarefasService"
import { RESOLVE_TYPES } from "../../../../shared/types/RESOLVE_TYPES"
import { SOURCE_TYPES } from "../../../../shared/types/SOURCE_TYPES"
import { toDateTimeLocal } from "../../../utils/dateUtils"

export const MonitorarModal = ({show, tarefa, onClose, caracteristicas, canteiros, plantas, loading}) => {
  if (!show) return null

  const { toastMessage } = useToast();
  const { user } = useAuth();
  const engine = useCalendarioEngine();

  const [stringTimestamp, setStringTimestamp] = useState(toDateTimeLocal(new Date()));
  
  const [form, setForm] = useState({})
  const [caracteristica, setCaracteristica] = useState({})
  const [writing, setWriting] = useState(false)
  
  useEffect(()=>{
    const formData = {}
    for (const alvo of (tarefa.contexto.alvos ?? [])) {
      formData[alvo.id] = {
        [tarefa.contexto.caracteristicaId]: {
          valor: tarefa.contexto.valor ?? 0,
          confianca: tarefa.contexto.valor ?? 100,
        }
      }
    }
    setForm(formData)
  },[tarefa])

  useEffect(()=>{
    const caracteristicaMonitorada = 
      caracteristicas.find((c)=>c.id === tarefa?.contexto?.caracteristicaId)
    setCaracteristica(caracteristicaMonitorada)
  }, [tarefa])  

  const aplicarMonitoramento = async (evt) => {    
    evt.preventDefault()
    
    // Recupera o timestamp
    const date = new Date(stringTimestamp);
    const timestamp = date.getTime();
    // Recupera o tipoEntidadeID
    const tipoEntidadeId = tarefa.contexto.tipoEntidadeId

    if (!tipoEntidadeId) {
      toastMessage({
        body: "Erro registrando o monitoramento",
        variant: VARIANT_TYPES.RED,
      })
      return;
    }

    // Monta o array de alvos
    const catalogMap = {
      [ENTITY_TYPES.CANTEIRO]: canteiros,
      [ENTITY_TYPES.PLANTA]: plantas,
    }
    const idsAlvos = new Set(tarefa.contexto.alvos.map(a => a.id));
    const entidades = catalogMap[tipoEntidadeId].filter(d => idsAlvos.has(d.id));

    // Processa os monitoramentos
    setWriting(true);
    const servicesMap = {
      [ENTITY_TYPES.CANTEIRO]: canteirosService,
      [ENTITY_TYPES.PLANTA]: plantasService,
    }
    try {
      await processarMonitoramento({
        tipoEntidadeId: tarefa.contexto.tipoEntidadeId,
        user,
        timestamp,
        medidas: form,
        entidades,
        services: {
          eventos: eventosService,
          entidade: servicesMap[tarefa.contexto.tipoEntidadeId],
          historicoEfeitos: historicoEfeitosService,
        }
      })
      //Conclui a tarefa
      concluirTarefa({
        tarefa,
        resolucao: {
          tipoResolucao: RESOLVE_TYPES.MONITOR,
          dataConclusao: timestamp,
          agente: {
            tipo: SOURCE_TYPES.USER,
            id: user.id,  
          },
        },
        user,
        tarefasService,
      })
      //Fecha modal
        toastMessage({
          body: `Monitoramento de ${entidades.length > 1 ? `${entidades.length} ${tarefa.contexto.tipoEntidadeId}s`: entidades[0].nome} registrado com sucesso.`,
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

  return (
    <Modal show={show} onHide={onClose}>
      <Form onSubmit={(evt)=>aplicarMonitoramento(evt)}>
      <Modal.Header closeButton>
        <Modal.Title>Registrar {tarefa?.contexto?.caracteristicaNome}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <StandardInput label="Data/hora" width="120px">
          <Form.Control
            type="datetime-local"
            value={stringTimestamp}
            onChange={(e)=> setStringTimestamp(e.target.value)}
          />
        </StandardInput>

        {tarefa?.contexto?.alvos?.map((alvo, i) => (
        <StandardCard key={alvo.id} header={alvo.nome}>
            <StandardInput
              label="Valor"
              unidade={loading ? "Carregando..."
              : caracteristica.unidade ?? "Valor"}
               unidadeWidth="80px"
            >
              <Form.Control
                type="number"
                min={caracteristica.min ?? 0}
                max={caracteristica.max ?? 1024}
                value={form[alvo.id]?.[caracteristica.id]?.valor ?? ""}
                onChange={(e) => setForm({...form, [alvo.id]:
                  {...form[alvo.id], [caracteristica.id]: {
                    ...(form[alvo.id]?.[caracteristica.id] ?? {}),
                    valor: Number(e.target.value)
                  }}}
                )}
              />
            </StandardInput>
            <StandardInput
              label="Confiança"
              unidade="%"
              unidadeWidth="80px"
              info={`Atual: ${tarefa.contexto.confiancaAtual}%`}
              infoWidth="120px"
            >
              <Form.Control
                type="number"
                min="0"
                max="100"
                value={form[alvo.id]?.[caracteristica.id]?.confianca ?? ""}
                onChange={(e) => setForm({...form, [alvo.id]:
                  {...form[alvo.id], [caracteristica.id]: {
                    ...(form[alvo.id]?.[caracteristica.id] ?? {}),
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
        <Button variant="success" type="submit">{writing ? "Salvando..." : "Salvar"}</Button>
      </Modal.Footer>
    </Form>
    </Modal>
  )
}