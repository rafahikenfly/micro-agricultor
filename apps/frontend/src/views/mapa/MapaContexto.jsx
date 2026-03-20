import React, { createContext, useContext, useReducer } from "react";
import { GEOMETRY_TYPES } from "micro-agricultor";
import { useSelection } from "../../hooks/useSelection";

export const ACOES_MAPA = {
  TOOL_SET: "TOOL_SET",
  TOOL_RESET: "TOOL_RESET",
  TOOLSTATE_SET: "TOOLSTATE_SET",
  TOOLSTATE_RESET: "TOOLSTATE_RESET",
  DRAG_SET: "DRAG_SET",
  DRAG_UPDATE: "DRAG_UPDATE",
  DRAG_ACTIVE: "DRAG_ACTIVE",
  DRAG_INACTIVE: "DRAG_INACTIVE",

  PREVIEW_SET: "PREVIEW_SET",
  PREVIEW_UPDATE: "PREVIEW_UPDATE",
  PREVIEW_ACTIVE: "PREVIEW_ACTIVE",

  MODAL_SHOW: "MODAL_SHOW",
  PAINEL_SHOW: "PAINEL_SHOW",

  // ================= UI SERVICES  =================
  // HEATMAP
  HEATMAP_SET: "HEATMAP_SET",
  HEATMAP_RESET: "HEATMAP_RESET",
  // PENDING MUTATION
  SET_PENDING_MUTATION: "SET_PENDING_MUTATION",
  RESET_PENDING_MUTATION: "RESET_PENDING_MUTATION",

};


/* ================= ESTADO INICIAL ================= */
const estadoInicialMapa = {
  layout: {
    toolbarWidth: 70,
  },
  tool: null,
  toolState: {
    desenhar: {},
    plantar: {},
    monitorar: {},
    inspecionar: {},
  },
  drag: {
    active: false,
    geometry: GEOMETRY_TYPES.RECT,
    preview: {
      fill: "rgba(0, 123, 255, 0.2)",
      stroke: "rgba(0, 123, 255, 0.9)",
      strokeWidth: 1,
      strokeDasharray: "6 4",
      pointerEvents: "none",
    }
  },
  preview: {
    active: false,
    geometry: GEOMETRY_TYPES.RECT,
    preview: {
      fill: "rgba(217, 224, 11, 0.4)",
      stroke: "rgba(45, 211, 12, 0.9)",
      strokeWidth: 1,
      strokeDasharray: "6 4",
      pointerEvents: "none",
    }
  },
  show: {
    modal: null,
    painel: false,
  },
/*   // UI SERVICES
  pendingMutation: {      // tipo de evento para registro da persistencia
    actionType: null,
    before: null,
    after: null,
  },
  heatmap: {
    active: false,
    caracteristicaId: null,
    min: null,
    max: null,
  }, */
};

/* ================= REDUCER ================= */
function reducerMapa(state, action) {
  switch (action.type) {
  // ===== TOOL SET =====
  case ACOES_MAPA.TOOL_SET:
    return {
      ...state,
      tool: action.payload,
    };
  case ACOES_MAPA.TOOL_RESET:
    return {
      ...state,
      tool: null,
      drag: {
        ...state.drag,
        active: false,
      },
      preview: {
        ...state.preview,
        active: false,
      }
    };
  case ACOES_MAPA.TOOLSTATE_SET:
    return {
      ...state,
      toolState: {
        ...state.toolState,
        [state.tool]: action.payload,
      },
    };
  case ACOES_MAPA.TOOLSTATE_RESET:
  return {
      ...state,
      toolState: {
        ...state.toolState,
        [state.tool]: {},
      },
    };
    // ===== DRAG =====
  case ACOES_MAPA.DRAG_SET:
    return {
      ...state,
      drag: action.payload,
    };
  case ACOES_MAPA.DRAG_UPDATE:
    return {
      ...state,
      drag: {...state.drag, ...action.payload}
    };
  case ACOES_MAPA.DRAG_ACTIVE:
    return {
      ...state,
      drag: {
        ...state.drag,
        active: true,
        start: {x:0,y:0},
        current: {x:0,y:0},
      },
    };
  case ACOES_MAPA.DRAG_INACTIVE:
    return {
      ...state,
      drag: {
        ...state.drag,
        active: false
      },
    };
    // ===== PREVIEW =====
  case ACOES_MAPA.PREVIEW_SET:
    return {
      ...state,
      preview: action.payload,
    };
  case ACOES_MAPA.PREVIEW_UPDATE:
    return {
      ...state,
      preview: {...state.preview, ...action.payload}
    };
  case ACOES_MAPA.PREVIEW_ACTIVE:
    return {
      ...state,
      preview: {
        ...state.preview,
        active: action.payload,
        current: action.payload ? { x: 0, y: 0 } : state.preview.current,
      },
    };
  // ===== SHOW =====
  case ACOES_MAPA.MODAL_SHOW:
    return {
      ...state,
      show: {
        ...state.show,
        modal: action.payload,
      }
  };
  case ACOES_MAPA.PAINEL_SHOW:
    return {
      ...state,
      show: {
        ...state.show,
        painel: action.payload,
      }
  };
/* 
  // PENDING MUTATION
  case ACOES_MAPA.SET_PENDING_MUTATION:
    return {
      ...state,
      pendingMutation: {
        ...state.pendingMutation,
        ...action.payload,
      }
  };
  case ACOES_MAPA.RESET_PENDING_MUTATION:
    return {
      ...state,
      pendingMutation: {
        actionType: null,
        before: null,
        after: null,
      }
  };
  // HEATMAP
  case ACOES_MAPA.HEATMAP_SET:
    return {
      ...state,
      heatmap: {
        ...state.heatmap,
        ...action.payload,
        active: true,
      }
  };
  case ACOES_MAPA.HEATMAP_RESET:
    return {
      ...state,
      heatmap: {
        active: false,
        caracteristicaId: null,
        min: null,
        max: null,
      },
  };
 */
  default:
    console.error(`Reducer error: ${action.type} not set`)
    return state;
  }
}

// ================= CONTEXTO ================= 
const MapaContexto = createContext(null);

// ================= PROVIDER ================= 
export function MapaProvider({ children }) {
  const [state, dispatch] = useReducer(reducerMapa, estadoInicialMapa);
  const selection = useSelection()


return (
    <MapaContexto.Provider value={{ state, dispatch, selection, }}>
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