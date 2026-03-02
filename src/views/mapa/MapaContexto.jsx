import React, { createContext, useContext, useReducer } from "react";
import { TIPOS_EVENTO } from "../../utils/consts/TIPOS_EVENTO";

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
  PLACING_SET_PREVIEW_POINTS: "PLACING_SET_PREVIEW_POINTS",

  // ================= TOOLS =================
  TOOL_PLANT: "TOOL_PLANT",
  TOOL_DRAW: "TOOL_DRAW",
  TOOL_PAN: "TOOL_PAN",
  TOOL_MONITOR: "TOOL_MONITOR",
  TOOL_INSPECT: "TOOL_INSPECT",
  TOOL_HANDLE: "TOOL_HANDLE",
  TOOL_ROTATE: "TOOL_ROTATE",
  TOOL_RESET: "TOOL_RESET",
  
  // ================= MOUSE HANDLER =================
  MOUSE_MOVE: "MOUSE_MOVE",

  // ================= OPEN / HIDE =================
  OPENMODAL_CANTEIRO: "OPENMODAL_CANTEIRO",
  OPENMODAL_PLANTA: "OPENMODAL_PLANTA",
  OPENMODAL_HORTA: "OPENMODAL_HORTA",
  OPENCONFIG: "OPENCONFIG",
  HIDEMODAL_CANTEIRO: "HIDEMODAL_CANTEIRO",
  HIDEMODAL_PLANTA: "HIDEMODAL_PLANTA",
  HIDEMODAL_HORTA: "HIDEMODAL_HORTA",
  HIDECONFIG: "HIDECONFIG",
  MODALDATA_SET: "MODALDATA_SET",
  // ================= UI SERVICES  =================
  // DRAG
  OPENDRAG: "OPENDRAG",
  HIDEDRAG: "HIDEDRAG",
  DRAG_START: "DRAG_START",
  DRAG_FINISH: "DRAG_FINISH",
  DRAG_UPDATE: "DRAG_UPDATE",
  DRAG_RESET: "DRAG_RESET",
  DRAG_SETUP: "DRAG_SETUP",
  // RESIZE
  OPENRESIZE: "OPENRESIZE",
  HIDERESIZE: "HIDERESIZE",
  RESIZE_START: "RESIZE_START",
  RESIZE_FINISH: "RESIZE_FINISH",
  RESIZE_UPDATE: "RESIZE_UPDATE",
  RESIZE_RESET: "RESIZE_RESET",
  // PREVIEW
  OPENPREVIEW: "OPENPREVIEW",
  HIDEPREVIEW: "HIDEPREVIEW",
  PREVIEW_START: "PREVIEW_START",
  PREVIEW_FINISH: "PREVIEW_FINISH",
  PREVIEW_UPDATE: "PREVIEW_UPDATE",
  PREVIEW_RESET: "PREVIEW_RESET",
  // SELECT
  SELECT_SET: "SELECT_SET",
  SELECT_RESET: "SELECT_RESET",
  SELECT_CLEAR: "SELECT_CLEAR",
  SELECT_MODALDATA: "SELECT_MODALDATA",
  // HEATMAP
  HEATMAP_SET: "HEATMAP_SET",
  HEATMAP_RESET: "HEATMAP_RESET",
  // PENDING MUTATION
  SET_PENDING_MUTATION: "SET_PENDING_MUTATION",
  RESET_PENDING_MUTATION: "RESET_PENDING_MUTATION",

  // ================= MODES  =================
  // PLACE
  PLACING_START: "PLACING_START",
  PLACING_FINISH: "PLACING_FINISH",
  PLACING_UPDATE: "PLACING_UPDATE",
  PLACING_RESET: "PLACING_RESET",
  // DRAW
  DRAW_START: "DRAW_START",
  DRAW_FINISH: "DRAW_FINISH",
  DRAW_UPDATE: "DRAW_UPDATE",
  DRAW_RESET: "DRAW_RESET",
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
  mousePos: null,           // posição do mouse no mapa

  show: {
    modalCanteiro: false, // bool mostrar modal de canteiro
    modalPlanta: false,   // bool mostrar modal de planta
    modalHorta: false,    // bool mostrar modal de horta
    preview: false,       // bool mostrar preview no mouse
    drag: false,          // bool mostrar caixa de drag
    configPanel: false,   // bool mostrar painel de configuração
    heatmap: false,       // string renderizar mapa de calor de caracteristica
  },
  // UI SERVICES
  pendingMutation: {      // tipo de evento para registro da persistencia
    actionType: null,
    before: null,
    after: null,
  },
  drag: {
    active: false,
    start: null,
    end: null,
  },
  resize: {
    active: false,
    anchor: null,
    current: null,
    direction: null,
  },
  preview: {
    active: false,
    pontos: [],
    geometria: "rect",
    width: 0,
    height: 0,
  },
  select: {
    active: false,
    modalData: null,
    horta: [],
    canteiro: [],
    planta: [],
    //... outras entidades selecionáveis
  },
  heatmap: {
    active: false,
    caracteristicaId: null,
    min: null,
    max: null,
  },
  // MAP MODES
  draw: {
    active: false,
    tipoEntidadeId: "", // ou "planta", "sensor", etc
    geometria: "", // ou "circle", "rect", "ellipse", "polygon"
    gridSize: 0,
    vertices: [], // TODO; para draw polygon
  },
  placing: {
    active: false,
    tipoEntidadeId: "", // ou "planta", "sensor", etc
    layout: {
      linhas: 1,
      colunas: 1,
      espacamentoLinha: 30,
      espacamentoColuna: 30,
    },
  },
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

  case ACOES_MAPA.TOOL_PAN:
    return {
      ...state,
      modo: MODOS_MAPA.VIEW,
      activeAction: MODOS_MAPA.VIEW,
      activeTool: "pan",
      actionConfig: null,
      show: {
        ...state.show,
        configPanel: false,
      }
    };
  case ACOES_MAPA.TOOL_ROTATE:
    return {
      ...state,
      modo: MODOS_MAPA.VIEW,
      activeAction: "view",
      activeTool: "rotate",
      actionConfig: null,
      show: {
        ...state.show,
        configPanel: false,
      }
    };
  case ACOES_MAPA.TOOL_RESET:
    return {
      ...state,
      modo: MODOS_MAPA.VIEW,
      activeTool: null,
      actionConfig: null,
      show: {
        ...state.show,
        configPanel: false,
      }
    };

  // ===== MOUSE HANDLER =====
  case ACOES_MAPA.MOUSE_MOVE:
    return {
      ...state,
      mousePos: action.payload, // { x, y }
    };
  // ===== TOGGLE MODAL/OFFCANVAS =====
  case ACOES_MAPA.HIDECONFIG:
    return {
      ...state,
      show: {
        ...state.show,
        configPanel: false,
      }
   };
  case ACOES_MAPA.OPENCONFIG:
    return {
      ...state,
      show: {
        ...state.show,
        configPanel: true,
      }
    };
  case ACOES_MAPA.OPENMODAL_CANTEIRO:
    return {
      ...state,
      show: {
        modalHorta: false,
        modalCanteiro: true,
        modalPlanta: false,
      }
    };
  case ACOES_MAPA.HIDEMODAL_CANTEIRO:
    return {
      ...state,
      show: {
        ...state.show,
        modalCanteiro: false,
      }
    };
  case ACOES_MAPA.OPENMODAL_PLANTA:
    return {
      ...state,
      show: {
        modalHorta: false,
        modalCanteiro: false,
        modalPlanta: true,
      }
    };
  case ACOES_MAPA.HIDEMODAL_PLANTA:
    return {
      ...state,
      show: {
        ...state.show,
        modalPlanta: false,
      }
    };
  case ACOES_MAPA.OPENMODAL_HORTA:
    return {
      ...state,
      show: {
        modalHorta: true,
        modalCanteiro: false,
        modalPlanta: false,
      }
    };
  case ACOES_MAPA.HIDEMODAL_HORTA:
    return {
      ...state,
      show: {
        ...state.show,
        modalHorta: false,
      }
    };

  // =====
  // TOOL SELECT
  // =====
  case ACOES_MAPA.TOOL_PLANT:
    // PLANTAR -
    // - ATIVA posicionamento de entidade, com planta preconfigurada.
    // - DESATIVA desenho
    // - DESATIVA select
    // - MOSTRA configPanel
    return {
      ...state,
      activeTool: "plant",
      placing: {
        ...state.placing,
        active: true,
        serving: "plant",
        tipoEntidadeId: "planta",
      },
      draw: {
        ...state.draw,
        active: false,
      },
      select: {
        ...state.select,
        active: false,
      },
      show: {
        ...state.show,
        configPanel: true,
      }
    };
  case ACOES_MAPA.TOOL_DRAW:
    // DESENHAR -
    // - ATIVA desenho
    // - DESATIVA posicionamento de entidade.
    // - DESATIVA select
    // - MOSTRA configPanel
    // - ESCONDE preview
    return {
      ...state,
      activeTool: "draw",
      placing: {
        ...state.placing,
        active: false,
      },
      draw: {
        ...state.draw,
        active: true,
      },
      select: {
        ...state.select,
        active: false,
      },
      drag: {
        ...state.drag,
        serving: "draw",
      },
      show: {
        ...state.show,
        configPanel: true,
        preview: false,
      },
    };
  case ACOES_MAPA.TOOL_MONITOR:
    // MONITORAR
    // - DESATIVA desenho
    // - DESATIVA posicionamento de entidade
    // - ATIVA select
    // - MOSTRA configPanel
    // - ESCONDE preview
    // - ESCONDE drag
    return {
      ...state,
      activeTool: "monitor",
      placing: {
        ...state.placing,
        active: false,
      },
      draw: {
        ...state.draw,
        active: false,
      },
      select: {
        ...state.select,
        active: true,
        serving: "monitor",
      },
      show: {
        ...state.show,
        configPanel: true,
        drag: false,
        preview: false,
      }
    };
  case ACOES_MAPA.TOOL_HANDLE:
    // MANEJAR
    // - DESATIVA desenho
    // - DESATIVA posicionamento de entidade
    // - ATIVA select
    // - MOSTRA configPanel
    // - ESCONDE preview
    // - ESCONDE drag
    return {
      ...state,
      activeTool: "handle",
      placing: {
        ...state.placing,
        active: false,
      },
      draw: {
        ...state.draw,
        active: false,
      },
      select: {
        ...state.select,
        active: true,
        serving: "handle",
      },
      show: {
        ...state.show,
        configPanel: true,
        drag: false,
        preview: false,
      }
    };
  case ACOES_MAPA.TOOL_INSPECT:
    // MANEJAR
    // - DESATIVA desenho
    // - DESATIVA posicionamento de entidade
    // - ATIVA select
    // - MOSTRA configPanel
    // - ESCONDE preview
    // - ESCONDE drag
    return {
      ...state,
      activeTool: "inspect",
      placing: {
        ...state.placing,
        active: false,
      },
      draw: {
        ...state.draw,
        active: false,
      },
      select: {
        ...state.select,
        active: true,
        serving: "inspect",
      },
      show: {
        ...state.show,
        configPanel: true,
        drag: false,
        preview: false,
      }
  };

  // =====
  // UI SERVICES (RESIZE, DRAG, PREVIEW, SELECT, PENDING_MUTATION)
  // =====
  // RESIZE
  // TODO: case ACOES_MAPA.HIDERESIZE:
  // TODO: case ACOES_MAPA.OPENRESIZE:
  case ACOES_MAPA.RESIZE_START:
    return {
      ...state,
      resize: {
        ...action.payload,
        active: true,
      },
      event: TIPOS_EVENTO.RESIZE,
  };
  case ACOES_MAPA.RESIZE_FINISH:
    return {
      ...state,
      resize: {
        active: false
      },
  };
  case ACOES_MAPA.RESIZE_UPDATE:
    if (!state.resize.active) return state
    return {
      ...state,
      resize: {
        ...state.resize,
        current: action.payload,
      }
  };
  // TODO: case ACOES_MAPA.RESIZE_RESET:
  // DRAG
  case ACOES_MAPA.HIDEDRAG:
    return {
    ...state,
    show: {
      ...state.show,
      drag: false,
    }
  };
  case ACOES_MAPA.OPENDRAG:
    return {
      ...state,
      show: {
        ...state.show,
        drag: true,
      }
  };
  case ACOES_MAPA.DRAG_START:
    return {
      ...state,
      drag: {
        active: true,
        start: action.payload,
        end: action.payload,
      }
  };
  case ACOES_MAPA.DRAG_FINISH:
    return {
      ...state,
      drag: {
        ...state.drag,
        active: false,
      },
  };
  case ACOES_MAPA.DRAG_UPDATE:
    if (!state.drag.active) return state
    return {
      ...state,
      drag: {
        ...state.drag,
        end: action.payload
      }
  };
  case ACOES_MAPA.DRAG_RESET:
    return {
      ...state,
      drag: {
        active: false,
        start: null,
        end: null,
      }
    };
  case ACOES_MAPA.DRAG_SETUP:
    return {
      ...state,
      drag: {
        ...state.drag,
        ...action.payload,
      }
    };
  // PREVIEW
  case ACOES_MAPA.HIDEPREVIEW:
    return {
      ...state,
      show: {
        ...state.show,
        preview: false,
      }
   };
  case ACOES_MAPA.OPENPREVIEW:
    return {
      ...state,
      show: {
        ...state.show,
        preview: true,
      }
    };
  case ACOES_MAPA.PREVIEW_START:
    return {
      ...state,
      preview: {
        ...action.payload,
        active: true,
      }
  };
  case ACOES_MAPA.PREVIEW_FINISH:
    return {
      ...state,
      preview: {
        active: false,
      }
  };
  case ACOES_MAPA.PREVIEW_RESET:
    return {
      ...state,
      preview: {
        active: false,
        pontos: [],
        geometria: "rect",
        width: 0,
        height: 0,
      }
    };
  // SELECT
  case ACOES_MAPA.SELECT_SET:
    return {
      ...state,
      select: {
        ...state.select,
        [action.list]: action.payload,
      }
    };
  case ACOES_MAPA.SELECT_CLEAR:
    return {
      ...state,
      select: {
        ...state.select,
        [action.list]: [],
      }
    };
  case ACOES_MAPA.SELECT_RESET:
    return {
      ...state,
      select: {
        active: false,
        modalData: null,
        horta: [],
        canteiro: [],
        planta: [],
      }
  };
  case ACOES_MAPA.SELECT_MODALDATA:
    return {
      ...state,
      select: {
        ...state.select,
        modalData: action.payload
      }
    };
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

    // ==== MODO DESENHO/DRAW (UI: MAPA DRAG)
  case ACOES_MAPA.DRAW_START:
    return {
      ...state,
      draw: {
        active: true,
        ...action.payload,
      }
  };
  case ACOES_MAPA.DRAW_FINISH:
    return {
      ...state,
      draw: {
        ...state.placing,
        active: false,
      },
  };
  case ACOES_MAPA.DRAW_UPDATE:
    if (!state.placing.active) return state
    return {
      ...state,
      draw: {
        ...state.draw,
        ...action.payload,
      }
  };
  case ACOES_MAPA.DRAW_RESET:
    return {
      ...state,
      draw: {
        active: false,
        tipoEntidadeId: "",
        geometria: "",
        drag: {
          active: false,
          start: null,
          end: null,
        },
        vertices: [],
      },
      //        factory: criarCanteiro, // função que gera entidade final
  };
  // ==== MODO PLACING (UI: MAPA PREVIEW)
  case ACOES_MAPA.PLACING_START:
    return {
      ...state,
      placing: {
        active: true,
        ...action.payload,
      }
  };
  case ACOES_MAPA.PLACING_FINISH:
    return {
      ...state,
      placing: {
        ...state.placing,
        active: false,
      },
  };
  case ACOES_MAPA.PLACING_UPDATE:
    if (!state.placing.active) return state
    return {
      ...state,
      placing: {
        ...state.placing,
        ...action.payload,
      }
  };
  case ACOES_MAPA.PLACING_RESET:
    return {
      ...state,
      placing: {
        active: false,
        tipoEntidadeId: "planta", // ou "planta", "sensor", etc
        preview: {
          geometria: "circle",
          radius: 10,
          pontos: [],
        },
        layout: {
          linhas: 1,
          colunas: 1,
          espacamentoLinha: 40,
          espacamentoColuna: 40,
        },
        metadata: {
          especie,
          tecnica,
          variedade,
        }
//        factory: criarCanteiro, // função que gera entidade final
      }
  };

  default:
    console.error(`Reducer error: ${action.type} no set`)
    return state;
  }
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