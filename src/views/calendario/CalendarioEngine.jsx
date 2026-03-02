import { useCalendario, ACOES_CALENDARIO } from "./CalendarioContexto";

// ================ CONTROLLER ================ //
export function useCalendarioEngine() {
  const { state, dispatch } = useCalendario();

  // ================= VISUALIZAÇÃO ================= //

  const setModoAgenda = () => {
    dispatch({
      type: ACOES_CALENDARIO.SET_MODO,
      payload: "agenda",
    });
  };

  const setShowModalMonitorar = (show) => {
    dispatch({
      type: ACOES_CALENDARIO.SETSHOW_MODALMONITORAR,
      payload: show,
    });
  }
  const setShowModalTarefa = (show) => {
    dispatch({
      type: ACOES_CALENDARIO.SETSHOW_MODALTAREFA,
      payload: show,
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
  const setModalData = (data) => {
    dispatch({
      type: ACOES_CALENDARIO.SET_MODALDATA,
      payload: data,
    });
  }
  const resetModalData = () => {
    dispatch({
      type: ACOES_CALENDARIO.RESET_MODALDATA,
    });
  }

  const setModoMes = () => {
    dispatch({
      type: ACOES_CALENDARIO.SET_MODO,
      payload: "mes",
    });
  };

  const toggleModo = () => {
    dispatch({
      type: ACOES_CALENDARIO.SET_MODO,
      payload: state.modo === "agenda" ? "calendario" : "agenda",
    });
  };

  // ================= INTERVALO ================= //

  const setIntervalo = (inicio) => {
    dispatch({
      type: ACOES_CALENDARIO.SET_INICIO,
      payload: { inicio },
    });
  };

  const irParaHoje = () => {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    dispatch({
      type: ACOES_CALENDARIO.SET_INICIO,
      payload: inicio,
    });
  };

  const proximo = () => {
    if (!state.intervalo?.inicio) return;
    
    const { inicio, tamanho } = state.intervalo;
    const base = new Date(inicio);
    let novoInicio;
    
    switch (tamanho) {
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
  const anterior = () => {
    if (!state.intervalo?.inicio) return;

    const { inicio, tamanho } = state.intervalo;
    const base = new Date(inicio);
    let novoInicio;

    switch (tamanho) {
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
        break;

      case "dia":
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
  const tamanho = (tamanho) => {
    dispatch({
      type: ACOES_CALENDARIO.SET_TAMANHO,
      payload: tamanho,
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
  const filtros = state.filtros;
  const intervalo = state.intervalo;
  const itemSelecionado = state.itemSelecionado;

  const isAgenda = modo === "agenda";
  const isMes = modo === "calendario" && intervalo.tamanho === "mes";
  const isSemana = modo === "calendario" && intervalo.tamanho === "semana";
  const isDia = modo === "calendario" && intervalo.tamanho === "dia";

  const showModalMonitorar = state.show.modalMonitorar
  const showModalTarefa = state.show.modalTarefa
  const showEventos = state.show.eventos
  const showTarefas = state.show.tarefas
    // ================= API ================= //

  return {
    /* raw */
    state,

    /* visualização */
    setModoAgenda,
    setModoMes,
    setShowModalMonitorar,
    setShowModalTarefa,
    setShowEventos,
    setShowTarefas,
    toggleModo,
    isAgenda,
    isMes,
    isSemana,
    isDia,
    showModalMonitorar,
    showModalTarefa,
    showTarefas,
    showEventos,
    
    /* intervalo */
    setIntervalo,
    irParaHoje,
    proximo,
    tamanho,
    anterior,
    intervalo,


    /* filtros */
    setFiltros,
    filtros,

    /* seleção */
    selecionarItem,
    setModalData,
    resetModalData,
    limparSelecao,
    itemSelecionado,
  };
}