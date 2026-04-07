import { EVENTO, EVENTO_TYPES } from "micro-agricultor"
import { useToast } from "../../../services/toast/toastProvider";

export function createCalendarioTarefaHandler(engine, tarefa) {
  const { toastMessage } = useToast()

  return {
    onClick (e) {
      engine.selecionarItem({ id: tarefa.id, type: "tarefa" })
    },
    onDoubleClick(e) {
      engine.setShowModal({
        tipo: tarefa.contexto.tipoEventoId,
        data: tarefa,
      });
    },
    onExecutar(e) {
      if (tarefa.contexto.tipoEventoId === EVENTO.MONITORAMENTO.id) {
        engine.setModalData({
          tipo: tarefa.contexto.tipoEventoId,
          data:tarefa
        })
        engine.setShowModalMonitorar(true)
      }
      if (tarefa.contexto.tipoEventoId === EVENTO.MANEJO.id) {
        engine.setModalData(tarefa)
        engine.setShowModalManejar(true)
      }
      else {
        console.error(`Sem onExecutar cadastrado para ${tarefa.contexto.tipoEventoId}`)
      }
    }
  }
}