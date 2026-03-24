import { ENTITY_TYPES, VARIANT_TYPES, validarMidia, MIME_TYPES, MIDIA } from "micro-agricultor";
import CapturaImagemEntidade from "../../../components/CapturaImagemEntidade";
import { getImageDimensions } from "../../../utils/blobUtils";
import { storage, timestamp } from "../../../firebase";
import { unixToReadableString } from "../../../utils/dateUtils";
import { midiasService } from "../../../services/crud/midiasService";
import { catalogosService } from "../../../services/catalogosService";
import { resolvePrimarySelection } from "../../../utils/catalogUtils";

export default function PainelFotografar({ show, selection, catalogos, onCancel}) {

  const handleCapturar = async ({ blob, previewUrl, descricao = ""}) => {
    try {
      const { largura, altura } = await getImageDimensions(blob);
      const id = toolSetup.fotografar.entidadeId
      const storagePath = `/midias/${id === "" ? "NOT_DEFINED" : id}/${id}_${Date.now()}`
      const url = await salvarImagemStorage(blob, storagePath);
      const novaMidia = validarMidia({
      nome: `Álbum de ${toolSetup.fotografar.entidadeNome}`, //TODO: pegar do form
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
  }

  async function salvarImagemStorage(blob, path) {
    const ref = storage.ref(path);
    await ref.put(blob);
    return ref.getDownloadURL();
  }

  const entidade = resolvePrimarySelection(selection, catalogos)
  
  return (
    <CapturaImagemEntidade
      ativa={show}
      entidade={entidade}
      onCapture={handleCapturar}
      onCancel={onCancel}
    />
  )
}
