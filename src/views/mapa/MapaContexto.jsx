import React, { createContext, useContext, useEffect, useReducer } from "react";

/* ================= CONSTS ================= */ //TODO: MOVER PARA /UTILS?
export const MODOS_MAPA = {
  EDIT: "edit",
  PLANT: "plant",
  DRAW: "draw",
  VIEW: "view",
};

export const ACOES_MAPA = {
  // ================= TRANSFORM =================
  TRANSFORM_SET: "TRANSFORM_SET",       // payload: {x,y,scale,rotate,offset}
  TRANSFORM_ZOOM: "TRANSFORM_ZOOM",     // scale
  TRANSFORM_RESET: "TRANSFORM_RESET",   // reset view
  TRANSFORM_ROTATE: "TRANSFORM_ROTATE", // rotate
  
  // ================= CONTEXTO DE ACAO =================
  ACTION_CONFIG: "ACTION_CONFIG",
  ACTION_CANCEL: "ACTION_CANCEL",
  ACTION_HIDECONFIG: "ACTION_HIDECONFIG",
  ACTION_SHOWCONFIG: "ACTION_SHOWCONFIG",
  ACTION_SET_PREVIEW_POINTS: "ACTION_SET_PREVIEW_POINTS",
  SELECTION_SET: "SELECTION_SET",
  
  // ================= TOOLS =================
  TOOL_PLANT: "TOOL_PLANT",
  TOOL_PAN: "TOOL_PAN",
  TOOL_MONITOR: "TOOL_MONITOR",
  TOOL_INSPECT: "TOOL_INSPECT",
  TOOL_HANDLE: "TOOL_HANDLE",
  TOOL_ROTATE: "TOOL_ROTATE",
  TOOL_RESET: "TOOL_RESET",
  
  // ================= MOUSE HANDLER =================
  MOUSE_MOVE: "MOUSE_MOVE",

  /* NOT USED
    // ================= DRAG / DRAW =================
    /* ================= MODOS =================
    //  MODE_DRAW: "MODE_DRAW",
    MODE_SET: "MODE_SET",                 // força modo específico
    MODE_PLANT: "MODE_PLANT",
    MODE_EDIT: "MODE_EDIT",
    MODE_VIEW: "MODE_VIEW",

    /* ================= TRANSFORM =================
    TRANSFORM_PAN: "TRANSFORM_PAN",       // dx, dy
    TRANSFORM_ZOOM_BY: "TRANSFORM_ZOOM_BY", // factor
    TRANSFORM_ROTATE_BY: "TRANSFORM_ROTATE_BY", // delta
    TRANSFORM_OFFSET_SET: "TRANSFORM_OFFSET_SET", // offset absoluto
    TRANSFORM_CENTER: "TRANSFORM_CENTER", // centerOn(x,y)

    /* ================= NAVIGATION =================
    //  NAV_FOCUS_ENTITY: "NAV_FOCUS_ENTITY", // foco em entidade
    //  NAV_FIT_BOUNDS: "NAV_FIT_BOUNDS",     // bbox + padding
    //  NAV_CENTER_ON: "NAV_CENTER_ON",       // x,y
    //  NAV_ZOOM_TO_CURSOR: "NAV_ZOOM_TO_CURSOR", // cursor + scale

    /* ================= GRID =================
    //  GRID_SET: "GRID_SET",
    //  GRID_CLEAR: "GRID_CLEAR",
    //  GRID_TOGGLE: "GRID_TOGGLE",

    DRAG_SET: "DRAG_SET",                 // mapDrag
    DRAG_CLEAR: "DRAG_CLEAR",
    DRAW_PREVIEW_SET: "DRAW_PREVIEW_SET",
    DRAW_PREVIEW_CLEAR: "DRAW_PREVIEW_CLEAR",

    /* ================= PREVIEW =================
    PREVIEW_SET: "PREVIEW_SET",           // mapPreview
    PREVIEW_CLEAR: "PREVIEW_CLEAR",

    /* ================= SELECTION =================

    /* ================= SYSTEM =================
    MAP_INIT: "MAP_INIT",                 // init map
    MAP_RESET: "MAP_RESET",               // reset geral
    MAP_WORLD_SET: "MAP_WORLD_SET",        // mapWorld
  */
};


/* ================= ESTADO INICIAL ================= */
const estadoInicialMapa = {
  transform: {
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    offset: { x: 0, y: 0 },
  },
  mousePos: null,   // posição do mouse no SVG (coordenada do mundo)

  activeAction: null,     // ação ativa
  actionConfig: null,     // configuração da ação
  showActionPanel: false, // mostrar painel de configuração

  preview: null,
};

/* ================= REDUCER ================= */
function reducerMapa(state, action) {
  switch (action.type) {
  // ===== NAVEGAÇÃO =====
  case ACOES_MAPA.TRANSFORM_ZOOM:
    return {
      ...state,
      transform: {
        ...state.transform,
        scale: action.scale,
      },
    };
  case ACOES_MAPA.TRANSFORM_ROTATE:
    return {
      ...state,
      transform: {
        ...state.transform,
        rotate: action.rotate,
      },
    };
  case ACOES_MAPA.TRANSFORM_RESET:
    return {
      ...state,
      transform: {
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        offset: { x: 0, y: 0 },
      },
    };
  case ACOES_MAPA.TRANSFORM_SET:
    return {
      ...state,
      transform: {
        ...state.transform,
        ...action.payload,
      },
    };

  // ===== CONTEXTO DE AÇÃO =====
  case ACOES_MAPA.ACTION_CONFIG:
    return {
      ...state,
      actionConfig: action.config,
      showActionPanel: false,
    };
  case ACOES_MAPA.ACTION_CANCEL:
    return {
      ...state,
      modo: MODOS_MAPA.VIEW,
      activeTool: null,
      activeAction: null,
      actionConfig: null,
      showActionPanel: false,
    };
  case ACOES_MAPA.ACTION_HIDECONFIG:
    return {
      ...state,
      showConfigPanel: false,
   };
  case ACOES_MAPA.ACTION_SHOWCONFIG:
    return {
      ...state,
      showConfigPanel: true,
    };
  case ACOES_MAPA.ACTION_SET_PREVIEW_POINTS:
    return {
      ...state,
      actionConfig: {
        ...state.actionConfig,
        preview: {
          ...state.actionConfig.preview,
          pontos: action.payload
        }
      }
    };
  case ACOES_MAPA.SELECTION_SET:
    return {
      ...state,
      selection: action.payload
    };

  // ===== FERRAMENTAS =====
  case ACOES_MAPA.TOOL_PLANT:
    return {
      ...state,
      modo: MODOS_MAPA.PLANT,
      activeAction: MODOS_MAPA.PLANT,
      activeTool: "plantar",
      showConfigPanel: true,
    };
  case ACOES_MAPA.TOOL_PAN:
    return {
      ...state,
      modo: MODOS_MAPA.VIEW,
      activeAction: MODOS_MAPA.VIEW,
      activeTool: "pan",
      actionConfig: null,
      showConfigPanel: false,
    };
  case ACOES_MAPA.TOOL_MONITOR:
    return {
      ...state,
      modo: MODOS_MAPA.EDIT,
      activeAction: MODOS_MAPA.EDIT,
      activeTool: "monitor",
      actionConfig: null,
      showConfigPanel: true,
    };
  case ACOES_MAPA.TOOL_INSPECT:
    return {
      ...state,
      modo: MODOS_MAPA.VIEW,
      activeAction: MODOS_MAPA.VIEW,
      activeTool: "inspect",
      actionConfig: null,
      showConfigPanel: true,
    };
  case ACOES_MAPA.TOOL_HANDLE:
    return {
      ...state,
      modo: MODOS_MAPA.EDIT,
      activeAction: MODOS_MAPA.EDIT,
      activeTool: "handle",
      actionConfig: null,
      showConfigPanel: true,
    };
  case ACOES_MAPA.TOOL_ROTATE:
    return {
      ...state,
      modo: MODOS_MAPA.VIEW,
      activeAction: "view",
      activeTool: "rotate",
      actionConfig: null,
      showActionPanel: false,
    };
  case ACOES_MAPA.TOOL_RESET:
    return {
      ...state,
      modo: MODOS_MAPA.VIEW,
      activeTool: null,
      actionConfig: null,
      showConfigPanel: true,
    };

  // ===== MOUSE HANDLER =====
  case ACOES_MAPA.MOUSE_MOVE:
    return {
      ...state,
      mousePos: action.payload, // { x, y }
    };
  default:
    console.error(`Reducer error: ${action.type} no set`)
    return state;
  }
  /* NOT USED

    case ACOES_MAPA.TOOL_GRID_TOGGLE:
      return {
        ...state,
        gridArray: state.gridArray.length ? [] : [10, 50],
      };


  case ACOES_MAPA.TRANSFORM_PAN:
    return {
      ...state,
      transform: {
        ...state.transform,
        x: state.transform.x + action.dx,
        y: state.transform.y + action.dy,
      },
    };
  */

}

// ================= CONTEXTO ================= 
const MapaContexto = createContext(null);

// ================= PROVIDER ================= 
export function MapaProvider({ children }) {
  const [state, dispatch] = useReducer(reducerMapa, estadoInicialMapa);

return (
    <MapaContexto.Provider value={{ state, dispatch }}>
      {children}
    </MapaContexto.Provider>
  );
}

// ================= HOOK ================= 
export function useMapa() {
  const ctx = useContext(MapaContexto);
  if (!ctx) {
    throw new Error("useMap deve ser usado dentro de um MapProvider");
  }
  return ctx;
}

// ================= EXPORTS ================= 
export {
  estadoInicialMapa,
  reducerMapa,
};