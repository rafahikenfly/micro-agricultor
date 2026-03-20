import { EVENTO_TYPES } from "@shared/types/EVENTO_TYPES"
import { useToast } from "../../../services/toast/toastProvider";

export function createCalendarioTarefaHandler(engine, tarefa) {
  const { toastMessage } = useToast()

  return {
    onClick (e) {
      engine.selecionarItem({ id: tarefa.id, type: "tarefa" })
    },
    onDoubleClick(e) {
      engine.setModalData(tarefa);
      engine.setShowModalTarefa(true);
    },
    onExecutar(e) {
      if (tarefa.contexto.tipoEventoId === EVENTO_TYPES.MONITOR) {
        engine.setModalData(tarefa)
        engine.setShowModalMonitorar(true)
      }
      if (tarefa.contexto.tipoEventoId === EVENTO_TYPES.HANDLE) {
        engine.setModalData(tarefa)
        engine.setShowModalManejar(true)
      }
      else {
        console.error(`Sem onExecutar cadastrado para ${tarefa.contexto.tipoEventoId}`)
      }
    }
  }
}