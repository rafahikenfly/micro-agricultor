import { VARIANTE, ENTIDADE } from "micro-agricultor";
import CanteiroModal from "../../admin/canteiros/CanteiroModal";
import PlantaModal from "../../admin/plantas/PlantaModal";
import { useMapaEngine } from "../MapaEngine";
import { plantasService, canteirosService } from "../../../services/crudService";
import { useAuth } from "../../../services/auth/authContext";
import { useToast } from "../../../services/toast/toastProvider";
import InspecaoModal from "./InspecaoModal";
import ModalFiltrar from "./ModalFiltrar";

export default function MapaModals() {
  const { user } = useAuth();
  const { toastMessage } = useToast();
  const { showModal, setShowModal } = useMapaEngine();

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
    case ENTIDADE.canteiro.id:
      return (
        <CanteiroModal
          show={true}
          data={showModal.data}
          onSave={showModal.data.editavelNoMapa ? 
            (data)=>salvar(data, canteirosService, ENTIDADE[showModal.tipoEntidadeId]) : 
            false
          }
          onClose={() => setShowModal(null)}
        />
      );

    case ENTIDADE.planta.id:
      return (
        <PlantaModal
          show={true}
          data={showModal.data}
          onSave={showModal.data.editavelNoMapa ? 
            (data)=>salvar(data, plantasService, ENTIDADE[showModal.tipoEntidadeId]) :
            false
          }
          onClose={() => setShowModal(null)}
        />
      );
    case "inspecionar":
      return (
        <InspecaoModal
          data={showModal.data}
          show={true}
          onClose={() => setShowModal(null)}
        />
      );
    case "filtrar":
      return (
        <ModalFiltrar 
          show={true}
          onClose={() => setShowModal(null)}
        />
      )
    default:
      return null;
  }
}