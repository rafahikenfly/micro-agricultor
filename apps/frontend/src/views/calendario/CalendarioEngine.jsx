import { useCalendario, ACOES_CALENDARIO } from "./CalendarioContexto";

// ================ CONTROLLER ================ //
export function useCalendarioEngine() {
  const { state, dispatch } = useCalendario();

  // ================= VISUALIZAÇÃO ================= //

  const setModo = (modo) => {
    dispatch({
      type: ACOES_CALENDARIO.SET_MODO,
      payload: modo,
    });
  };
  const setShowModal = (modalConfig) => {
    dispatch({
      type: ACOES_CALENDARIO.SETSHOW_MODAL,
      payload: modalConfig,
    });
  }

  const setShowEventos = (show) => {
    dispatch({
      type: ACOES_CALENDARIO.SETSHOW_EVENTOS,
      payload: show,
    });
  }
  const setShowTarefas = (show) => {
    dispatch({
      type: ACOES_CALENDARIO.SETSHOW_TAREFAS,
      payload: show,
    });
  }


  const irParaHoje = () => {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    dispatch({
      type: ACOES_CALENDARIO.SET_INICIO,
      payload: inicio,
    });
  };
  const avancar = () => {
    if (!inicio) return;
    const base = new Date(inicio);
    let novoInicio;
    
    switch (modo) {
      case "mes":
        novoInicio = new Date(
          inicio.getFullYear(),
          inicio.getMonth() + 1,
          1
        );
        break;

      case "semana":
        novoInicio = new Date(base);
        novoInicio.setDate(base.getDate() + 7);
        break;

      case "dia":
      case "agenda":
        novoInicio = new Date(base);
        novoInicio.setDate(base.getDate() + 1);
        break;

      default:
        return;
    }

    dispatch({
      type: ACOES_CALENDARIO.SET_INICIO,
      payload: novoInicio,
    });
  };
  const voltar = () => {   
    if (!inicio) return;
    const base = new Date(inicio);
    let novoInicio;
    
    switch (modo) {
      case "mes":
        novoInicio = new Date(
          base.getFullYear(),
          base.getMonth() - 1,
          1
        );
        break;

      case "semana":
        novoInicio = new Date(base);
        novoInicio.setDate(base.getDate() - 7);
        console.log(inicio,base,novoInicio)
        break;

      case "dia":
      case "agenda":
        novoInicio = new Date(base);
        novoInicio.setDate(base.getDate() - 1);
        break;

      default:
        return;
    }

    dispatch({
      type: ACOES_CALENDARIO.SET_INICIO,
      payload: novoInicio,
    });
  }

  // ================= FILTROS ================= //

  const setFiltros = (payload) => {
    dispatch({
      type: ACOES_CALENDARIO.SET_FILTROS,
      payload,
    });
  };

  // ================= SELEÇÃO ================= //

  const selecionarItem = (item) => {
    dispatch({
      type: ACOES_CALENDARIO.SELECT_ITEM,
      payload: item,
    });
  };

  const limparSelecao = () => {
    dispatch({
      type: ACOES_CALENDARIO.CLEAR_SELECTION,
    });
  };

  // ================= SELECTORS ================= //

  const modo = state.modo;
  const inicio = state.inicio;
  const showEventos = state.show.eventos
  const showTarefas = state.show.tarefas
  const showModal = state.show.modal


  const filtros = state.filtros;
  const intervalo = state.intervalo;
  const itemSelecionado = state.itemSelecionado;

    // ================= API ================= //

  return {
    /* visualização */
    setModo,
    modo,
    avancar,
    voltar,
    inicio,
    setShowEventos,
    setShowTarefas,
    showTarefas,
    showEventos,
    
    setShowModal,
    showModal,

    irParaHoje,


    /* filtros */
    setFiltros,
    filtros,

    /* seleção */
    selecionarItem,
    limparSelecao,
    itemSelecionado,
  };
}