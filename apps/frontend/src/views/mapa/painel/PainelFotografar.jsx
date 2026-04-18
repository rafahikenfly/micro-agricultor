import { VARIANT_TYPES, validarMidia, MIME_TYPES, MIDIA } from "micro-agricultor";
import CapturaImagemEntidade from "../../../components/CapturaImagemEntidade";
import { getImageDimensions } from "../../../utils/blobUtils";
import { storage } from "../../../firebase";
import { unixToReadableString } from "../../../utils/dateUtils";
import { resolvePrimarySelection } from "../../../utils/catalogUtils";
import { useToast } from "../../../services/toast/toastProvider";
import { useEffect, useState } from "react";
import { useMapaEngine } from "../MapaEngine";
import { useAuth } from "../../../services/auth/authContext";
import { cacheService } from "../../../services/cacheService";
import { midiasService } from "../../../services/crudService";

export default function PainelFotografar({ show, caches, onCancel}) {

  const { user } = useAuth();
  const { toastMessage } = useToast();
  const { selection } = useMapaEngine();

  const [ entidade, setEntidade ] = useState(resolvePrimarySelection(selection, caches))

  useEffect(()=>{
    setEntidade(resolvePrimarySelection(selection, caches))
  },[selection, caches])

  const handleCapturar = async ({ blob, previewUrl, descricao = ""}) => {
    try {
      const timestamp = Date.now();
      const { largura, altura } = await getImageDimensions(blob);
      const id = entidade.id
      const storagePath = `/midias/${id === "" ? "NOT_DEFINED" : id}/${id}_${Date.now()}`
      const url = await salvarImagemStorage(blob, storagePath);
      const novaMidia = validarMidia({
      nome: `Álbum de ${entidade.nome}`,
      descricao: `${descricao}. Tirado a partir do mapa em ${unixToReadableString(timestamp)}`,
      mimeType: MIME_TYPES.JPEG, //TODO: ALGO ESTA ERRADO
      tipoMediaId: MIDIA.CAPTURA.id,
      contexto: {
        hortaId: entidade.hortaId ?? "",
        entidadeId: entidade.id ?? "",
        tipoEntidadeId: selection.primaryType(),
        timestamp,
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
      cacheService.clear("midias");
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
  
  return (
    <CapturaImagemEntidade
      ativa={show}
      entidade={entidade}
      onCapture={handleCapturar}
      onCancel={onCancel}
    />
  )
}
