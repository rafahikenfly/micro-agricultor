export function useCrudUI({
    crudService,
    nomeEntidade,
    masculino = true, // "o" ou "a"
    user,
  
    // estados e setters
    editando,
    setEditando,
    setShowModal,
    registroParaExcluir,
    cancelarExclusao,
  
    // feedback
    showToast,
  }) {

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
  
    const atualizar = async (data) => {
      try {
        if (data.id) {
          await crudService.update(editando.id, data, user);
          showToast(
            `${nomeCapitalizado} atualizad${masculino ? "o" : "a"} com sucesso`
          );
        } else {
          await crudService.create(data, user);
          showToast(
            `${nomeCapitalizado} criad${masculino ? "o" : "a"} com sucesso`
          );
        }
      } catch (err) {
        console.error(err);
        showToast(
          `Erro ao ${editando ? "atualizar" : "criar"} ${masculino ? "o" : "a"} ${nomeEntidade}`,
          "danger"
        );
      } finally {
        setShowModal(false);
        setEditando(null);
      }
    };
  
    const apagar = async () => {
      if (!registroParaExcluir) return;
  
      try {
        await crudService.remove(registroParaExcluir.id, user);
        showToast(
          `${nomeCapitalizado} removid${masculino ? "o" : "a"} com sucesso`
        );
      } catch (err) {
        console.error(err);
        showToast(`Erro ao remover ${masculino ? "o" : "a"} ${nomeEntidade}`, "danger");
      } finally {
        cancelarExclusao();
      }
    };
  
    const arquivar = async (data) => {
      try {
        await crudService.archive(data.id, user);
        showToast(
          `${nomeCapitalizado} arquivad${masculino === "o" ? "o" : "a"} com sucesso`
        );
      } catch (err) {
        console.error(err);
        showToast(`Erro ao arquivar ${masculino} ${nomeEntidade}`, "danger");
      }
    };
  
    const desarquivar = async (data) => {
      try {
        await crudService.restore(data.id, user);
        showToast(
          `${nomeCapitalizado} desarquivad${masculino === "o" ? "o" : "a"} com sucesso`
        );
      } catch (err) {
        console.error(err);
        showToast(`Erro ao desarquivar ${masculino} ${nomeEntidade}`, "danger");
      }
    };
  
    return {
      criar,
      editar,
      atualizar,
      apagar,
      arquivar,
      desarquivar,
    };
  }