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

  // ==== TOOL ACTIONS (UI INTENTS) === //
  const toggleZoom = () => {
    dispatch({ type: ACOES_MAPA.TOOL_ZOOM_TOGGLE });
  };
  const toggleGrid = () => {
    dispatch({ type: ACOES_MAPA.TOOL_GRID_TOGGLE });
  };
  const activateDrawRect = () => {
    dispatch({ type: ACOES_MAPA.TOOL_DRAW_RECT });
  };
  const activateDrawCircle = () => {
    dispatch({ type: ACOES_MAPA.TOOL_DRAW_CIRCLE });
  };
  const activateRotateTool = () => {
    dispatch({ type: ACOES_MAPA.TOOL_ROTATE });
  };
  const activatePanTool = () => {
    dispatch({ type: ACOES_MAPA.TOOL_PAN });
  };
  const activatePlantTool = () => {
    dispatch({ type: ACOES_MAPA.TOOL_PLANT });
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
  const closeConfigPanel = () =>{
    dispatch({type: ACOES_MAPA.ACTION_HIDECONFIG})
  }
  const openConfigPanel = () =>{
    dispatch({type: ACOES_MAPA.ACTION_SHOWCONFIG})
  }
  const setMousePos = (p) => {
    dispatch({
      type: ACOES_MAPA.MOUSE_MOVE,
      payload: p,
    });
  };

  // ==== SELECTORS (DERIVED STATS) === //

//  const isEditMode = state.modo === MODOS_MAPA.EDIT;
//  const isDrawMode = state.modo === MODOS_MAPA.DRAW;
  const isPlantMode = state.modo === MODOS_MAPA.PLANT;
  const isViewMode = state.modo === MODOS_MAPA.VIEW;
  const isForcePan = state.activeTool === "pan";
  const isForceRotate = state.activeTool === "rotate";
  const showActionPanel = state.showActionPanel

  const scale = state.transform.scale;
  const rotation = state.transform.rotate;
  const position = { x: state.transform.x, y: state.transform.y };

  const isZoomedIn = scale > 1;
  const isRotated = rotation !== 0;
  const isPanned = state.transform.x !== 0 || state.transform.y !== 0;


  //const hasGrid = state.gridArray.length > 0;
  const isZoomEnabled = state.hasZooming;

  // ==== API === //
  return {
    /* raw */
    state,

    /* tool actions */
      //inutils
    toggleZoom,
    toggleGrid,
    activateDrawRect,
    activateDrawCircle,
      //utils
    activateRotateTool,
    activatePlantTool,
    activatePanTool,
    resetTools,

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
//    isDrawMode,
//    hasGrid,
    isZoomEnabled,
    isZoomedIn,
    isRotated,
    isPanned,
    scale,
    rotation,
    position,


    // usados
    isViewMode,
    zoomAt,
    isForcePan,
    pan,
    isForceRotate,
    rotateBy,
    setMousePos,

    //tool
    resetAction,
    isPlantMode,
    enterPlantMode,
    configAction,
    showConfigPanel: showActionPanel,
    closeConfigPanel,
    openConfigPanel,
  };
}
