import { VARIANT_TYPES } from "micro-agricultor";
import { useAuth } from "../../../services/auth/authContext";
import { useToast } from "../../../services/toast/toastProvider";
import { storage } from "../../../firebase";

export default function CalendarioModals() {
  const { user } = useAuth();
  const { toastMessage } = useToast();

  if (true) return null;

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

    

    default:
      return null;
  }
}