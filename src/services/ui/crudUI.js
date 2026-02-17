import { setToast } from "./toast";

export function useCrudUI({
    crudService,
    nomeEntidade,
    masculino = true, // "o" ou "a"
    user,
  
    // estados
    editando,
    registroParaExcluir,
//    cancelarExclusao,

    // setters
    setEditando,
    setShowModal,
    setRegistroParaExcluir, 
    setShowToast,
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
          await crudService.update(crudService.getRefById(editando.id), data, user);
          setToast({ body: `${nomeCapitalizado} atualizad${masculino ? "o" : "a"} com sucesso`, }, setShowToast);
        } else {
          await crudService.create(data, user);
          setToast({ body: `${nomeCapitalizado} criad${masculino ? "o" : "a"} com sucesso`, }, setShowToast);
        }
      } catch (err) {
        console.error(err,data,user);
        setToast({
          body: `Erro ao ${editando ? "atualizar" : "criar"} ${masculino ? "o" : "a"} ${nomeEntidade}`,
          variant: "danger"
        }, setShowToast);
      } finally {
        setShowModal(false);
        setEditando(null);
      }
    };
  
    const apagar = async () => {
      if (!registroParaExcluir) return;
  
      try {
        await crudService.remove(registroParaExcluir.id, user);
        setShowToast({ body: `${nomeCapitalizado} removid${masculino ? "o" : "a"} com sucesso` }, setShowToast);
      } catch (err) {
        console.error(err);
        setShowToast({
          body: `Erro ao remover ${masculino ? "o" : "a"} ${nomeEntidade}`,
          variant: "danger"
        }, setShowToast);
      } finally {
        cancelarExclusao();
      }
    };
  
    const arquivar = async (data) => {
      try {
        await crudService.archive(data.id, user);
        setShowToast({ body: `${nomeCapitalizado} arquivad${masculino === "o" ? "o" : "a"} com sucesso` }, setShowToast);
      } catch (err) {
        console.error(err);
        setShowToast({
          body: `Erro ao arquivar ${masculino ? "o" : "a"} ${nomeEntidade}`,
          variant: "danger"
        }, setShowToast);
      }
    };
  
    const desarquivar = async (data) => {
      try {
        await crudService.restore(data.id, user);
        setShowToast({ body: `${nomeCapitalizado} desarquivad${masculino === "o" ? "o" : "a"} com sucesso` }, setShowToast);
      } catch (err) {
        console.error(err);
        setShowToast({
          body: `Erro ao desarquivar ${masculino ? "o" : "a"} ${nomeEntidade}`,
          variant: "danger"
        });
      }
    };
  
    const apagarComConfirmacao = (data) => {
      setRegistroParaExcluir(data);
      setShowToast({
        body: `Confirma a exclusão do ${nomeEntidade} ${data.nome}?`,
        variant: "danger",
        confirmacao: true,
        onConfirm: apagar,
        onCancel: cancelarExclusao,
      });
    };
    
    const cancelarExclusao = () => {
      setRegistroParaExcluir(null);
      setShowToast({show: false});
    };


    return {
      criar,
      editar,
      atualizar,
      apagar,
      arquivar,
      desarquivar,
      apagarComConfirmacao,
      cancelarExclusao,
    };
  }