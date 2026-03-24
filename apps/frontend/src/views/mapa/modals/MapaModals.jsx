import { ENTITY_TYPES, VARIANT_TYPES, ENTIDADE } from "micro-agricultor";
import CanteiroModal from "../../admin/canteiros/CanteiroModal";
import PlantaModal from "../../admin/plantas/PlantaModal";
import { useMapaEngine } from "../MapaEngine";
import { canteirosService } from "../../../services/crud/canteirosService";
import { plantasService } from "../../../services/crud/plantasService";
import { useAuth } from "../../../services/auth/authContext";
import { useToast } from "../../../services/toast/toastProvider";
import InspecaoModal from "./InspecaoModal";

export default function MapaModals() {
  const { user } = useAuth();
  const { toastMessage } = useToast();
  const { showModal, setShowModal, toolSetup} = useMapaEngine();

  if (!showModal) return null;

  const salvar = async (data, crudService, ENTIDADE) => {
    try {
      if (data.id) {
        await crudService.update(crudService.getRefById(data.id), data, user);
        toastMessage({
          body: `${ENTIDADE.nome} atualizad${ENTIDADE.masculino ? "o" : "a"} com sucesso`,
          variant: VARIANT_TYPES.GREEN,
        });
      }
      else {
        await crudService.create(data, user);
        toastMessage({
          body: `${ENTIDADE.nome} criad${ENTIDADE.masculino ? "o" : "a"} com sucesso`,
          variant: VARIANT_TYPES.GREEN,
        });
      }
    } catch (err) {
      console.error(err,data,user);
      toastMessage({
        body: `Erro ao ${data.id ? "atualizar" : "criar"} ${ENTIDADE.masculino ? "o" : "a"} ${ENTIDADE.id}`,
        variant: VARIANT_TYPES.RED
      });
    } finally {
      setShowModal(null);
    }
  }


  switch (showModal.tipoEntidadeId) {
    case ENTITY_TYPES.CANTEIRO:
      return (
        <CanteiroModal
          show={true}
          data={showModal.data}
          onSave={(data)=>salvar(data, canteirosService, ENTIDADE[showModal.tipoEntidadeId])}
          onClose={() => setShowModal(null)}
        />
      );

    case ENTITY_TYPES.PLANTA:
      return (
        <PlantaModal
          show={true}
          data={showModal.data}
          onSave={(data)=>salvar(data, plantasService, ENTIDADE[showModal.tipoEntidadeId])}
          onClose={() => setShowModal(null)}
        />
      );
    case "inspecionar": 
      return (
        <InspecaoModal
          show={true}
          data={showModal.data}
          onClose={() => setShowModal(null)}

        />
      );

    default:
      return null;
  }
}