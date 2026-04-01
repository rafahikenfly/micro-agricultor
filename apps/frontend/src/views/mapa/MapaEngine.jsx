import { useMapa, ACOES_MAPA } from "./MapaContexto";

export function useMapaEngine() {
  const { state, dispatch, selection } = useMapa();


  // ==== TOOL ==== //
  const setTool = (toolId) => {
    dispatch({
      type: ACOES_MAPA.TOOL_SET,
      payload: toolId,
    });
  };
  const resetTool = () => {
    dispatch({
      type: ACOES_MAPA.TOOL_RESET
    });
  };
  const setToolState = (config) => {
    dispatch({
      type: ACOES_MAPA.TOOLSTATE_SET,
      payload: config,
    });
  }
  const resetToolState = () => {
    dispatch({
      type: ACOES_MAPA.TOOLSTATE_RESET,
    });
  }

  // ==== DRAG ==== //
  const setMapDrag = (config) => {
    dispatch({
      type: ACOES_MAPA.DRAG_SET,
      payload: config,
    });
  };
  const updateMapDrag = (config) => {
    dispatch({
      type: ACOES_MAPA.DRAG_UPDATE,
      payload: config,
    });
  };
  const setMapDragActive = (active) => {
    dispatch({
      type: ACOES_MAPA.DRAG_ACTIVE,
      payload: active,
    });
  }
  const finishMapDrag = () => {
    dispatch({
      type: ACOES_MAPA.DRAG_INACTIVE,
    });
  }
  // ==== PREVIEW ==== //
  const setMapPreview = (config) => {
    dispatch({
      type: ACOES_MAPA.PREVIEW_SET,
      payload: config,
    });
  };
  const updateMapPreview = (config) => {
    dispatch({
      type: ACOES_MAPA.PREVIEW_UPDATE,
      payload: config,
    });
  };
  const setMapPreviewActive = (active) => {
    dispatch({
      type: ACOES_MAPA.PREVIEW_ACTIVE,
      payload: active
    });
  }

  // ==== SHOW ==== //
  const setShowModal = (modalConfig) => {
    dispatch({
      type: ACOES_MAPA.MODAL_SHOW,
      payload: modalConfig,
    })
  }
  const setShowPainel = (painelConfig) => {
    dispatch({
      type: ACOES_MAPA.PAINEL_SHOW,
      payload: painelConfig,
    })
  }
/*   // HEATMAP
  const heatmapSet = (caracteristica) => {
    dispatch({
      type: ACOES_MAPA.HEATMAP_SET,
      payload: caracteristica,
    });
  }
  const heatmapReset = () => {
    dispatch({
      type: ACOES_MAPA.HEATMAP_RESET,
    });
  }

  // PENDING MUTATION
  const setPendingMutation = (data) => {
    dispatch({
      type: ACOES_MAPA.SET_PENDING_MUTATION,
      payload: data
    })
  }
  const resetPendingMutation = () => {
    dispatch({
      type: ACOES_MAPA.RESET_PENDING_MUTATION
    })
  } */


  // ==== SELECTORS (DERIVED STATS) === //
  const activeTool = state.tool
  const toolSetup = state.toolState
  const dragActive = state.drag.active
  const dragSetup = state.drag
  const previewActive = state.preview.active
  const previewSetup = state.preview
  const showModal = state.show.modal
  const showPainel = state.show.painel
  
/*   const isHeatmapActive = (tipoEntidadeId) => {
    if (!tipoEntidadeId) return state.heatmap.active;
    return (
      state.heatmap.active &&
      state.heatmap.tipoEntidadeId === tipoEntidadeId
    );
  }; */

  return {
    setTool,
    resetTool,
    setToolState,
    resetToolState,
    activeTool,
    toolSetup,

    selection,

    setMapDrag,
    updateMapDrag,
    setMapDragActive,
    finishMapDrag,
    dragActive,
    dragSetup,

    showModal,
    setShowModal,

    showPainel,
    setShowPainel,

    setMapPreview,
    updateMapPreview,
    setMapPreviewActive,
    previewActive,
    previewSetup,

  };
}