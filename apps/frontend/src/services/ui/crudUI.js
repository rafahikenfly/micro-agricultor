import { VARIANTE } from "micro-agricultor";
import { useToast } from "../toast/toastProvider";

// TODO: mover para HOOKS

export function useCrudUI({
    crudService,
    nomeEntidade,
    masculino = true, // "o" ou "a"
    user,
  
    // estados
    editando,

    // setters
    setEditando,
    setShowModal,
  }) {
  const { toastMessage, toastConfirm } = useToast();  
    if (!crudService) {
      console.error("crudService não definido", crudService);
      return {};
    }
    
    const nomeCapitalizado =
      nomeEntidade.charAt(0).toUpperCase() + nomeEntidade.slice(1);
  
    const criar = () => {
      setEditando(null);
      setShowModal(true);
    };
  
    const editar = (data) => {
      setEditando(data);
      setShowModal(true);
    };

    const duplicar = (data) => {
      const {
        id,
        createdAt,
        createdBy,
        updatedAt,
        updatedBy,
        isArchived,
        isDeleted,
        version,
        ...rest } = data;      
      setEditando(rest);
      setShowModal(true);
    }
  
    const atualizar = async (data) => {
      try {
        if (data.id) {
          await crudService.update(crudService.getRefById(editando.id), data, user);
          toastMessage({
            body: `${nomeCapitalizado} atualizad${masculino ? "o" : "a"} com sucesso`,
            variant: "success",
          });
        }
        else {
          await crudService.create(data, user);
          toastMessage({
            body: `${nomeCapitalizado} criad${masculino ? "o" : "a"} com sucesso`,
            variant: "success",
          });
        }
      } catch (err) {
        console.error(err,data,user);
        toastMessage({
          body: `Erro ao ${editando ? "atualizar" : "criar"} ${masculino ? "o" : "a"} ${nomeEntidade}`,
          variant: "danger"
        });
      } finally {
        setShowModal(false);
        setEditando(null);
      }
    };
  
    const apagar = async (id) => {
      if (!id) return;
      try {
        await crudService.remove(crudService.getRefById(id), user);
        toastMessage({
          body: `${nomeCapitalizado} removid${masculino ? "o" : "a"} com sucesso`,
          variant: VARIANTE.GREEN.variant,
        });
      } catch (err) {
        console.error(err);
        toastMessage({
          body: `Erro ao remover ${masculino ? "o" : "a"} ${nomeEntidade}`,
          variant: VARIANTE.RED.variant,
        });
      }
    };
  
    const arquivar = async (data) => {
      try {
        await crudService.archive(crudService.getRefById(data.id), user);
        toastMessage({
          body: `${nomeCapitalizado} arquivad${masculino === "o" ? "o" : "a"} com sucesso`,
          variant: "success",
        });
      } catch (err) {
        console.error(err);
        toastMessage({
          body: `Erro ao arquivar ${masculino ? "o" : "a"} ${nomeEntidade}`,
          variant: "danger"
        });
      }
    };
  
    const desarquivar = async (data) => {
      try {
        await crudService.unarchive(crudService.getRefById(data.id), user);
        toastMessage({
          body: `${nomeCapitalizado} desarquivad${masculino === "o" ? "o" : "a"} com sucesso`,
          variant: "success",
        });
      } catch (err) {
        console.error(err);
        toastMessage({
          body: `Erro ao desarquivar ${masculino ? "o" : "a"} ${nomeEntidade}`,
          variant: "danger"
        });
      }
    };
  
    const apagarComConfirmacao = (data) => {
      toastConfirm({
        body: `Confirma a exclusão do ${nomeEntidade} ${data.nome}?`,
        onConfirm: () => apagar(data.id),
        onCancel: cancelarExclusao,
        variant: "danger",
      });
    };
    
    const cancelarExclusao = () => {
      // NADA
    };


    return {
      criar,
      editar,
      atualizar,
      apagar,
      duplicar,
      arquivar,
      desarquivar,
      apagarComConfirmacao,
      cancelarExclusao,
    };
  }