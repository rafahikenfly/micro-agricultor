import { useMapa, ACOES_MAPA, MODOS_MAPA } from "./MapaContexto";

const clamp = (v, min, max) => {
  if (![v, min, max].every(Number.isFinite)) return 0;
  return Math.max(min, Math.min(max, v));
}

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 5;
const MIN_PAN = -300; //TODO: USAR BOUNDING
const MAX_PAN = 1500;

// ================ CONTROLLER ================ //
export function useMapaEngine() {
  const { state, dispatch } = useMapa();

  // ==== TOOL SELECT === //
  const activateDrawTool = () => {
    dispatch({ type: ACOES_MAPA.TOOL_DRAW });
  };
  const activatePlantTool = () => {
    dispatch({ type: ACOES_MAPA.TOOL_PLANT });
  };

  //////// REVISAR!
  const activateRotateTool = () => {
    dispatch({ type: ACOES_MAPA.TOOL_ROTATE });
  };
  const activatePanTool = () => {
    dispatch({ type: ACOES_MAPA.TOOL_PAN });
  };
  const activateInspectTool = () => {
    dispatch({ type: ACOES_MAPA.TOOL_INSPECT });
  };
  const activateHandleTool = () => {
    dispatch({ type: ACOES_MAPA.TOOL_HANDLE });
  };
  const activateMonitorTool = () => {
    dispatch({ type: ACOES_MAPA.TOOL_MONITOR });
  };
  const resetTools = () => {
    dispatch({ type: ACOES_MAPA.TOOL_RESET });
  };

  // ==== TRANSFORM ACTIONS === //
  const pan = (dx, dy) => {
    const { x, y } = state.transform;
    const nx = clamp(x + dx, MIN_PAN, MAX_PAN);
    const ny = clamp(y + dy, MIN_PAN, MAX_PAN);
    dispatch({
      type: ACOES_MAPA.TRANSFORM_SET,
      payload: { x: nx, y: ny  
    }});
  };
  const setPan = (x, y) => {
    const nx = clamp(x, MIN_PAN, MAX_PAN);
    const ny = clamp(y, MIN_PAN, MAX_PAN);
    dispatch({ 
      type: ACOES_MAPA.TRANSFORM_SET, 
      payload: { x: nx, y: ny } 
    });
  };

  const zoom = (scale) => {
    const clamped = clamp(scale, MIN_ZOOM, MAX_ZOOM);

    dispatch({ 
      type: ACOES_MAPA.TRANSFORM_ZOOM, 
      clamped 
    });
  };
  const zoomAt = (factor, cx, cy) => {
    const { x, y, scale } = state.transform;

    const newScaleRaw = scale * factor;
    const newScale = clamp(newScaleRaw, MIN_ZOOM, MAX_ZOOM);

    const nx = cx - (cx - x) * (newScale / scale);
    const ny = cy - (cy - y) * (newScale / scale);

    dispatch({
      type: ACOES_MAPA.TRANSFORM_SET,
      payload: {
        x: nx,
        y: ny,
        scale: newScale,
      }
    });
  };
  const zoomBy = (factor) => {
    const next = state.transform.scale * factor;
    const clamped = clamp(next, MIN_ZOOM, MAX_ZOOM);

    dispatch({
      type: ACOES_MAPA.TRANSFORM_ZOOM,
      scale: clamped,
    });
  };

  const rotate = (deg) => {
  dispatch({ 
    type: ACOES_MAPA.TRANSFORM_ROTATE, 
    rotate: deg 
  });
  };
  const rotateBy = (deg) => {
  dispatch({ 
    type: ACOES_MAPA.TRANSFORM_ROTATE, 
    rotate: state.transform.rotate + deg 
  });
  };
  const resetView = () => {
  dispatch({ type: ACOES_MAPA.TRANSFORM_RESET });
  };

  // ==== NAVIGATION === //
  const centerOn = (x, y) => {
    dispatch({
      type: ACOES_MAPA.TRANSFORM_SET,
      payload: { x, y },
    });
  };
  const focusEntity = (entity) => {
    // usa bbox da entidade
    const { posicao, dimensao } = entity;
    dispatch({
      type: ACOES_MAPA.TRANSFORM_SET,
      payload: {
        x: posicao.x,
        y: posicao.y,
        scale: 1.5,
      },
    });
  };
  const fitToBounds = (bbox, padding = 50) => {
    // lógica matemática de fit
  };

  // ==== INPUT HANDLERS === //
  const onMousePan = (dx, dy) => {
    pan(dx, dy);
  };
  const onWheelZoom = (delta, cursor) => {
    // zoom relativo ao cursor
    zoomBy(delta > 0 ? 1.1 : 0.9);
  };
  const onRotateGesture = (deg) => {
    rotateBy(deg);
  };
  

  // ==== SEMANTIC ACTIONS === //
  const enterEditMode = () => {
    dispatch({ type: ACOES_MAPA.TOOL_PAN });
  };
  const enterDrawMode = () => {
    dispatch({ type: ACOES_MAPA.TOOL_DRAW_RECT });
  };
  const resetAction = () => {
    dispatch({ type: ACOES_MAPA.ACTION_CANCEL})
  }
  const enterPlantMode = () => {
    dispatch({ type: ACOES_MAPA.TOOL_PLANT });
  };
  const configAction = (config) => {
    dispatch({
      type: ACOES_MAPA.ACTION_CONFIG,
      config
    })
  }


  const hideConfigPanel = () =>{
    dispatch({type: ACOES_MAPA.HIDECONFIG})
  }
  const openConfigPanel = () =>{
    dispatch({type: ACOES_MAPA.OPENCONFIG})
  }
  const openModalCanteiro = () => {
    dispatch({type: ACOES_MAPA.OPENMODAL_CANTEIRO})
  }
  const openModalPlanta = () => {
    dispatch({type: ACOES_MAPA.OPENMODAL_PLANTA})
  }
  const openModalHorta = () => {
    dispatch({type: ACOES_MAPA.OPENMODAL_HORTA})
  }
  const hideModalCanteiro = () => {
    dispatch({type: ACOES_MAPA.HIDEMODAL_CANTEIRO})
  }
  const hideModalPlanta = () => {
    dispatch({type: ACOES_MAPA.HIDEMODAL_PLANTA})
  }
  const hideModalHorta = () => {
    dispatch({type: ACOES_MAPA.HIDEMODAL_HORTA})
  }
  const setMousePos = (p) => {
    dispatch({
      type: ACOES_MAPA.MOUSE_MOVE,
      payload: p,
    });
  }
  const setPreviewPoints = (pontos) => {
    dispatch({
      type: ACOES_MAPA.PLACING_SET_PREVIEW_POINTS,
      payload: pontos
    });
  }
  // =====
  // UI SERVICES (RESIZE, DRAG, PREVIEW, SELECT)
  // =====
  // DRAG
  const hideDrag = () => {
    dispatch({type: ACOES_MAPA.HIDEDRAG})
  }
  const openDrag = (modo) => {
    dispatch({
      type: ACOES_MAPA.OPENDRAG,
      payload: modo,
    })
  }
  const dragStart = (ponto) => {
    dispatch({
      type: ACOES_MAPA.DRAG_START,
      payload: ponto
    });
  }
  const dragUpdate = (ponto) => {
    dispatch({
      type: ACOES_MAPA.DRAG_UPDATE,
      payload: ponto
    });
  }
  const dragFinish = () => {
    dispatch({
      type: ACOES_MAPA.DRAG_FINISH,
    });
  }
  const dragReset = () => {
    dispatch({type: ACOES_MAPA.DRAG_RESET})
  }
  const dragSetup = (config) => {
    dispatch({
      type: ACOES_MAPA.DRAG_SETUP,
      payload: config
    });
  }
  // RESIZE
  const resizeStart = (payload) => { // {direction, anchor: {x, y}, current: {x, y}}
    dispatch({
      type: ACOES_MAPA.RESIZE_START,
      payload: payload
    });
  }
  const resizeUpdate = (ponto) => {
    dispatch({
      type: ACOES_MAPA.RESIZE_UPDATE,
      payload: ponto
    });
  }
  const resizeFinish = () => {
    dispatch({
      type: ACOES_MAPA.RESIZE_FINISH,
    });
  }
  // PREVIEW
  const openPreview = () => {
    dispatch({type: ACOES_MAPA.OPENPREVIEW})
  }
  const hidePreview = () => {
    dispatch({type: ACOES_MAPA.HIDEPREVIEW})
  }
  const previewStart = (geometria) => {
    dispatch({
      type: ACOES_MAPA.PREVIEW_START,
      payload: geometria
    });
  }
  const previewFinish = () => {
    dispatch({
      type: ACOES_MAPA.PREVIEW_FINISH,
    });
  }
  const previewReset = () => {
    dispatch({type: ACOES_MAPA.PREVIEW_RESET})
  }
  // SELECT
  const selectSet = (lista, selecao) => {
    dispatch({
      type: ACOES_MAPA.SELECT_SET,
      payload: selecao,
      list: lista,
    });
  }
  const selectClear = (lista) => {
    dispatch({
      type: ACOES_MAPA.SELECT_CLEAR,
      list: lista
    });
  }
  const selectReset = () => {
    dispatch({
      type: ACOES_MAPA.SELECT_RESET,
      payload: selecao
    });
  }
  const selectModalData = (data) => {
    dispatch({
      type: ACOES_MAPA.SELECT_MODALDATA,
      payload: data
    });
  }
  // HEATMAP
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

  // MODO PLACE
  const placeStart = (payload) => { // {tipoEntidadeId, preview, layout, metadata}
    dispatch({
      type: ACOES_MAPA.PLACING_START,
      payload: payload
    });
  }
  const placeUpdade = (payload) => {
    dispatch({
      type: ACOES_MAPA.PLACING_UPDATE,
      payload: payload
    });
  }
  const placeFinish = () => {
    dispatch({
      type: ACOES_MAPA.PLACING_FINISH,
    });
  }
  const placeReset = () => {
    dispatch({
      type: ACOES_MAPA.PLACING_RESET,
    });
  }

  //MODO DRAW
    const drawStart = (drawConfig) => { // {tipoEntidadeId, preview, layout, metadata}
    dispatch({
      type: ACOES_MAPA.DRAW_START,
      payload: drawConfig
    });
  }
  const drawUpdade = (payload) => {
    dispatch({
      type: ACOES_MAPA.DRAW_UPDATE,
      payload: payload
    });
  }
  const drawFinish = () => {
    dispatch({
      type: ACOES_MAPA.DRAW_FINISH,
    });
  }
  const drawReset = () => {
    dispatch({
      type: ACOES_MAPA.DRAW_RESET,
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
  }


  // ==== SELECTORS (DERIVED STATS) === //
  // modos
  const isEditMode = state.activeAction === MODOS_MAPA.EDIT;
  const isViewMode = state.activeAction === MODOS_MAPA.VIEW;

  // condicoes
  const isForcePan = state.activeTool === "pan";
  const isForceRotate = state.activeTool === "rotate";

  // ui service ativo
  const isDragging = state.drag.active
  const isResizing = (entidadeId = null) => {
    if (entidadeId === null) return state.resize.active;
    return (
      state.resize.active &&
      state.resize.entidade?.id === entidadeId
    );
  };
  const isPreviewing = state.preview.active
  
  // ação ativa
  const isPlacing = state.placing.active
  const isDrawing = state.draw.active
  const isSelecting = state.select.active
const isHeatmapActive = (tipoEntidadeId) => {
  if (!tipoEntidadeId) return state.heatmap.active;
  return (
    state.heatmap.active &&
    state.heatmap.tipoEntidadeId === tipoEntidadeId
  );
};
  // transform
  const scale = state.transform.scale;
  const rotation = state.transform.rotate;
  const position = { x: state.transform.x, y: state.transform.y };
  const transform = state.transform
  const isZoomedIn = scale > 1;
  const isRotated = rotation !== 0;
  const isPanned = state.transform.x !== 0 || state.transform.y !== 0;


  //const hasGrid = state.gridArray.length > 0;
  const isZoomEnabled = state.hasZooming;
  
  //modal || preview
  const showModalCanteiro = state.show.modalCanteiro
  const showModalPlanta = state.show.modalPlanta
  const showModalHorta = state.show.modalHorta
  const showPreview = state.show.preview
  const showDrag = state.show.drag
  const showConfigPanel = state.show.configPanel

  // selection
  const selection = (lista) => {
    if (!lista) return state.selection;
    return state.selection[lista];
  };
  const selectionCanteiros = state.select.canteiro
  const selectionHortas = state.select.horta
  const selectionPlantas = state.select.planta
  
  // ==== API === //
  return {
    /* raw */
    state,

    /* tool actions */
      //inutils
//    toggleZoom,
//    toggleGrid,
    //utils
    activateDrawTool,
    activateRotateTool,
    activatePlantTool,
    activateMonitorTool,
    activatePanTool,
    activateInspectTool,
    activateHandleTool,
//    pan,
    resetTools,
    isForcePan,

    /* transform */
    setPan,
    zoom,
    zoomBy,
    rotate,
    resetView,

    /* navigation */
    centerOn,
    focusEntity,
    fitToBounds,

    /* input */
    onMousePan,
    onWheelZoom,
    onRotateGesture,

    /* semantic modes */
    enterEditMode,
    enterDrawMode,

    /* selectors */
//    isEditMode,
//    hasGrid,
    isZoomEnabled,
    isZoomedIn,
    isRotated,
    isPanned,
    

    // usados
    isViewMode,
    zoomAt,
    isForceRotate,
    rotateBy,
    setMousePos,

    //tool
    resetAction,
    isEditMode,
    enterPlantMode,
    configAction,
    setPreviewPoints,

    //hide/show
    openModalCanteiro,
    openModalHorta,
    openModalPlanta,
    openConfigPanel,
    hideModalCanteiro,
    hideModalHorta,
    hideModalPlanta,
    hideConfigPanel,
    showModalCanteiro,
    showModalHorta,
    showModalPlanta,
    showConfigPanel,

    // UI SERVICES
    //drag
    openDrag,
    hideDrag,
    dragStart,
    dragUpdate,
    dragFinish,
    dragReset,
    dragSetup,
    showDrag,
    isDragging,

    //resize TODO: open, hide, reset, show
    resizeStart,
    resizeUpdate,
    resizeFinish,
    isResizing,

    //preview
    openPreview,
    hidePreview,
    previewStart,
    previewFinish,
    previewReset,
    showPreview,
    isPreviewing,

    //select
    selectSet,
    selectModalData,
    selectClear,
    selectReset,
    selection,
    selectionCanteiros,
    selectionHortas,
    selectionPlantas,
    isSelecting,

    //heatmap
    heatmapSet,
    heatmapReset,
    isHeatmapActive,

    //draw
    drawStart,
    isDrawing,

    //place
    placeStart,
    placeUpdade,
    placeFinish,
    placeReset,
    isPlacing,

    // transform
    scale,
    rotation,
    position,
    transform,


    //controle de mutacao
    setPendingMutation,
    resetPendingMutation,
  };
}
