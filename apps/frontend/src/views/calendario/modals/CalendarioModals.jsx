import { EVENTO, VARIANTE } from "micro-agricultor";
import { useAuth } from "../../../services/auth/authContext";
import { useToast } from "../../../services/toast/toastProvider";
import { ManejarModal } from "./ManejarModal";
import { useCalendarioEngine } from "../CalendarioEngine";
import { MonitorarModal } from "./MonitorarModal";

export default function MapaModals() {
  const { user } = useAuth();
  const { toastMessage } = useToast();
  const { showModal, setShowModal } = useCalendarioEngine();

  if (!showModal) return null;

  const salvar = async (data, crudService, ENTIDADE) => {
    try {
      if (data.id) {
        await crudService.update(crudService.getRefById(data.id), data, user);
        toastMessage({
          body: `${ENTIDADE.nome} atualizad${ENTIDADE.masculino ? "o" : "a"} com sucesso`,
          variant: VARIANTE.GREEN.variant,
        });
      }
      else {
        await crudService.create(data, user);
        toastMessage({
          body: `${ENTIDADE.nome} criad${ENTIDADE.masculino ? "o" : "a"} com sucesso`,
          variant: VARIANTE.GREEN.variant,
        });
      }
    } catch (err) {
      console.error(err,data,user);
      toastMessage({
        body: `Erro ao ${data.id ? "atualizar" : "criar"} ${ENTIDADE.masculino ? "o" : "a"} ${ENTIDADE.id}`,
        variant: VARIANTE.RED.variant
      });
    } finally {
      setShowModal(null);
    }
  }


  switch (showModal.tipo) {
    case EVENTO.MANEJO.id:
      return (
        <ManejarModal
          show={true}
          data={showModal.data}
          onClose={() => setShowModal(null)}
        />
      );
    case EVENTO.MONITORAMENTO.id:
      return (
        <MonitorarModal
          show={true}
          data={showModal.data}
          onClose={() => setShowModal(null)}
        />
      );
    default:
      console.warn(`showModal.tipo ${showModal.tipo} sem modal associado`)
      return null;
  }
}