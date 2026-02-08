import React, { createContext, useContext, useReducer } from "react";

/* ================= CONSTS ================= */ //TODO: MOVER PARA /UTILS?
export const MODOS_MAPA = {
  EDIT: "edit",
  PLANT: "plant",
  DRAW: "draw",
  VIEW: "view",
};

export const ACOES_MAPA = {
  /* ================= UI / TOOLS ================= */
//  TOOL_ZOOM_TOGGLE: "TOOL_ZOOM_TOGGLE",
//  TOOL_GRID_TOGGLE: "TOOL_GRID_TOGGLE",
//  TOOL_DRAW_RECT: "TOOL_DRAW_RECT",
//  TOOL_DRAW_CIRCLE: "TOOL_DRAW_CIRCLE",
MOUSE_MOVE: "MOUSE_MOVE",
TOOL_PLANT: "TOOL_PLANT",
TOOL_ROTATE: "TOOL_ROTATE",
TOOL_PAN: "TOOL_PAN",
//  TOOL_RESET: "TOOL_RESET",

  /* ================= MODOS ================= */
  MODE_SET: "MODE_SET",                 // força modo específico
  MODE_EDIT: "MODE_EDIT",
  MODE_DRAW: "MODE_DRAW",
  MODE_PLANT: "MODE_PLANT",
  MODE_VIEW: "MODE_VIEW",

  /* ================= TRANSFORM ================= */
  TRANSFORM_PAN: "TRANSFORM_PAN",       // dx, dy
  TRANSFORM_SET: "TRANSFORM_SET",       // payload: {x,y,scale,rotate,offset}
  TRANSFORM_ZOOM: "TRANSFORM_ZOOM",     // scale
  TRANSFORM_ZOOM_BY: "TRANSFORM_ZOOM_BY", // factor
  TRANSFORM_ROTATE: "TRANSFORM_ROTATE", // rotate
  TRANSFORM_ROTATE_BY: "TRANSFORM_ROTATE_BY", // delta
  TRANSFORM_RESET: "TRANSFORM_RESET",   // reset view
  TRANSFORM_OFFSET_SET: "TRANSFORM_OFFSET_SET", // offset absoluto
  TRANSFORM_CENTER: "TRANSFORM_CENTER", // centerOn(x,y)

  /* ================= NAVIGATION ================= */
//  NAV_FOCUS_ENTITY: "NAV_FOCUS_ENTITY", // foco em entidade
//  NAV_FIT_BOUNDS: "NAV_FIT_BOUNDS",     // bbox + padding
//  NAV_CENTER_ON: "NAV_CENTER_ON",       // x,y
//  NAV_ZOOM_TO_CURSOR: "NAV_ZOOM_TO_CURSOR", // cursor + scale

  /* ================= GRID ================= */
//  GRID_SET: "GRID_SET",
//  GRID_CLEAR: "GRID_CLEAR",
//  GRID_TOGGLE: "GRID_TOGGLE",

  /* ================= DRAG / DRAW ================= */
  DRAG_SET: "DRAG_SET",                 // mapDrag
  DRAG_CLEAR: "DRAG_CLEAR",
  DRAW_PREVIEW_SET: "DRAW_PREVIEW_SET",
  DRAW_PREVIEW_CLEAR: "DRAW_PREVIEW_CLEAR",

  /* ================= PREVIEW ================= */
  PREVIEW_SET: "PREVIEW_SET",           // mapPreview
  PREVIEW_CLEAR: "PREVIEW_CLEAR",

  /* ================= ACTION ================= */
  ACTION_CONFIG: "ACTION_CONFIG",
  ACTION_CANCEL: "ACTION_CANCEL",
  ACTION_HIDECONFIG: "ACTION_HIDECONFIG",
  ACTION_SHOWCONFIG: "ACTION_SHOWCONFIG",

  /* ================= SYSTEM ================= */
  MAP_INIT: "MAP_INIT",                 // init map
  MAP_RESET: "MAP_RESET",               // reset geral
  MAP_WORLD_SET: "MAP_WORLD_SET",        // mapWorld
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
  /*
    case ACOES_MAPA.TOOL_ZOOM_TOGGLE:
      return {
        ...state,
        hasZooming: !state.hasZooming,
      };

    case ACOES_MAPA.TOOL_GRID_TOGGLE:
      return {
        ...state,
        gridArray: state.gridArray.length ? [] : [10, 50],
      };

    case ACOES_MAPA.TOOL_PAN:
      return {
        ...state,
        modo: MODOS_MAPA.EDIT,
        activeTool: "pan",
        mapDrag: null,
      };

    case ACOES_MAPA.TOOL_DRAW_RECT:
      return {
        ...state,
        modo: MODOS_MAPA.DRAW,
        activeTool: "retangulo",
        mapDrag: {
          type: "rect",
          limit: true,
        },
      };

    case ACOES_MAPA.TOOL_DRAW_CIRCLE:
      return {
        ...state,
        modo: MODOS_MAPA.DRAW,
        activeTool: "circulo",
        mapDrag: {
          type: "circle",
          limit: true,
        },
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

  // USADOS
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
  case ACOES_MAPA.TRANSFORM_SET:
    return {
      ...state,
      transform: {
        ...state.transform,
        ...action.payload,
      },
    };
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
      showActionPanel: false,
   }
  case ACOES_MAPA.ACTION_SHOWCONFIG:
    return {
      ...state,
      showActionPanel: true,
   }
  case ACOES_MAPA.TOOL_PLANT:
    return {
      ...state,
      modo: MODOS_MAPA.PLANT,
      activeAction: MODOS_MAPA.PLANT,
      activeTool: "plantar",
      showActionPanel: true,
    };
  case ACOES_MAPA.TOOL_PAN:
    return {
      ...state,
      modo: MODOS_MAPA.VIEW,
      activeAction: "view",
      activeTool: "pan",
      actionConfig: null,
      showActionPanel: false,
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
      modo: MODOS_MAPA.EDIT,
      activeTool: null,
      mapDrag: null,
      mapPreview: null,
    };
  case ACOES_MAPA.MOUSE_MOVE:
    return {
      ...state,
      mousePos: action.payload, // { x, y }
    };
  default:
    console.error(`Reducer error: ${action.type} no set`)
    return state;
  }
}

/* ================= CONTEXTO ================= */
const MapaContexto = createContext(null);

/* ================= PROVIDER ================= */
export function MapaProvider({ children }) {
  const [state, dispatch] = useReducer(reducerMapa, estadoInicialMapa);

  return (
    <MapaContexto.Provider value={{ state, dispatch }}>
      {children}
    </MapaContexto.Provider>
  );
}

/* ================= HOOK ================= */
export function useMapa() {
  const ctx = useContext(MapaContexto);
  if (!ctx) {
    throw new Error("useMap deve ser usado dentro de um MapProvider");
  }
  return ctx;
}

/* ================= EXPORTS ================= */
export {
  estadoInicialMapa,
  reducerMapa,
};
