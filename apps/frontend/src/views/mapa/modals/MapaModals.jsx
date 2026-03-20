import { ENTITY_TYPES, VARIANT_TYPES, ENTIDADE, validarMidia, MIME_TYPES, MIDIA } from "micro-agricultor";
import CanteiroModal from "../../admin/canteiros/CanteiroModal";
import PlantaModal from "../../admin/plantas/PlantaModal";
import { useMapaEngine } from "../MapaEngine";
import { canteirosService } from "../../../services/crud/canteirosService";
import { plantasService } from "../../../services/crud/plantasService";
import { useAuth } from "../../../services/auth/authContext";
import { useToast } from "../../../services/toast/toastProvider";
import { getImageDimensions } from "../../../utils/blobUtils";
import { storage, timestamp } from "../../../firebase";
import { unixToReadableString } from "../../../utils/dateUtils";
import { midiasService } from "../../../services/crud/midiasService";
import CapturaImagemModal from "../../../components/CapturaImagemModal";
import InspecaoModal from "./InspecaoModal";
import { catalogosService } from "../../../services/catalogosService";

export default function MapaModals() {
  const { user } = useAuth();
  const { toastMessage } = useToast();
  const { showModal, setShowModal, toolSetup} = useMapaEngine();

  if (!showModal) return null;

  //TODO: ESSA FUNCAO CHEIRA A APPLICATION
  async function salvarImagemStorage(blob, path) {
    const ref = storage.ref(path);
    await ref.put(blob);
    return ref.getDownloadURL();
  }

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
    case "fotografar":
      return (
        <CapturaImagemModal
          show={true}
          onClose={() => setShowModal(null)}
          onCapture={async ({ blob, previewUrl, descricao }) => {
            try {
              const { largura, altura } = await getImageDimensions(blob);
              const id = toolSetup.fotografar.entidadeId
              const storagePath = `/midias/${id === "" ? "NOT_DEFINED" : id}/${id}_${Date.now()}`
              const url = await salvarImagemStorage(blob, storagePath);
              const novaMidia = validarMidia({
                nome: `Álbum de ${toolSetup.fotografar.entidadeNome}`,
                descricao: `${descricao}. Tirado a partir do mapa em ${unixToReadableString(toolSetup.fotografar.timestamp)}`,
                mimeType: MIME_TYPES.JPEG, //TODO: ALGO ESTA ERRADO
                tipoMediaId: MIDIA.CAPTURA.id,
                contexto: {
                  hortaId: "", //TODO
                  entidadeId: toolSetup.fotografar.entidadeId ?? "",
                  timestamp,
                  tipoEntidadeId: ENTITY_TYPES.PLANTA
                  //tipoEntidadeNome;
                }, 
                metadados: {
                  altura,
                  anotada: false,
                  bytes: blob.size,
                  largura,
                  storagePath,
                  url,
              }});
              midiasService.create(novaMidia, user)
              toastMessage({body: "Imagem salva.", variant: VARIANT_TYPES.GREEN})
              catalogosService.clearCache("midias");
            } catch (err) {
              toastMessage({body: "Falha ao salvar imagem.", variant: VARIANT_TYPES.RED})
              console.error("Erro ao salvar imagem:", err);
            }
          }}
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