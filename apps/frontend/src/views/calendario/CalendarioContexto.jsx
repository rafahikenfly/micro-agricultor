import React, { createContext, useContext, useReducer } from "react";

const CalendarioContexto = createContext(null);

export const ACOES_CALENDARIO = {
  SET_MODO: "SET_MODO",
  SET_INICIO: "SET_INICIO",
  SET_TAMANHO: "SET_TAMANHO",
  SET_FILTROS: "SET_FILTROS",
  SELECT_ITEM: "SELECT_ITEM",
  CLEAR_SELECTION: "CLEAR_SELECTION",
  SETSHOW_MODALMANEJAR: "SETSHOW_MODALMANEJAR",
  SETSHOW_MODALMONITORAR: "SETSHOW_MODALMONITORAR",
  SETSHOW_MODALTAREFA: "SETSHOW_MODALTAREFA",
  SETSHOW_EVENTOS: "SETSHOW_EVENTOS",
  SETSHOW_TAREFAS: "SETSHOW_TAREFAS",
  SET_MODALDATA: "SET_MODALDATA",
  RESET_MODALDATA: "RESET_MODALDATA",
};

const estadoInicialCalendario = {
  modo: "calendario", // "agenda" | "calendario"

  intervalo: {
    inicio: new Date(),
    fim: new Date(),
    tamanho: "semana", // "dia" | "semana" | "mes"
  },

  hortasSelecionadas: ["4NbaiMkpR9CRIizDdfQ9"],

//  filtros: {
//    categoriasEvento: [],   // natural, humano...
//    statusTarefa: [],       // pendente, concluida...
//  },

  show: {
    modalMonitorar: false,
    modalManejar: false,
    modalTarefa: false,
    eventos: false,
    tarefas: true,
  },
  modalData: null,

  itemSelecionado: null, // { id, type } ou null
};

function reducerCalendario(state, action) {
  switch (action.type) {

    case ACOES_CALENDARIO.SET_MODO:
      return {
        ...state,
        modo: action.payload,
      };

    case ACOES_CALENDARIO.SET_INICIO:
      return {
        ...state,
        intervalo: {
          ...state.intervalo,
          inicio: action.payload
        },
      };

    case ACOES_CALENDARIO.SET_TAMANHO:
      return {
        ...state,
        intervalo: {
          ...state.intervalo,
          tamanho: action.payload
        },
      };


    case ACOES_CALENDARIO.SET_HORTAS:
      return {
        ...state,
        hortasSelecionadas: action.payload,
      };

    case ACOES_CALENDARIO.SET_FILTROS:
      return {
        ...state,
        filtros: {
          ...state.filtros,
          ...action.payload,
        },
      };

    case ACOES_CALENDARIO.SELECT_ITEM:
      return {
        ...state,
        itemSelecionado: action.payload,
      };

    case ACOES_CALENDARIO.CLEAR_SELECTION:
      return {
        ...state,
        itemSelecionado: null,
      };

    case ACOES_CALENDARIO.SETSHOW_MODALMONITORAR:
      return {
        ...state,
        show: {
          ...state.show,
          modalMonitorar: action.payload,
        }
      };
    case ACOES_CALENDARIO.SETSHOW_MODALMANEJAR:
      return {
        ...state,
        show: {
          ...state.show,
          modalManejar: action.payload,
        }
      };
    case ACOES_CALENDARIO.SETSHOW_MODALTAREFA:
      return {
        ...state,
        show: {
          ...state.show,
          modalTarefa: action.payload,
        }
      };
    case ACOES_CALENDARIO.SETSHOW_EVENTOS:
      return {
        ...state,
        show: {
          ...state.show,
          eventos: action.payload,
        }
      };
    case ACOES_CALENDARIO.SETSHOW_TAREFAS:
      return {
        ...state,
        show: {
          ...state.show,
          tarefas: action.payload,
        }
      };
    case ACOES_CALENDARIO.SET_MODALDATA:
      return {
        ...state,
        modalData: action.payload,
      };
    case ACOES_CALENDARIO.RESET_MODALDATA:
      return {
        ...state,
        modalData: null,
      };
    
      
    default:
      console.error(`ReducerCalendario: ação ${action.type} não tratada`);
      return state;
  }
}

export function CalendarioProvider({ children }) {
  const [state, dispatch] = useReducer(
    reducerCalendario,
    estadoInicialCalendario
  );

  return (
    <CalendarioContexto.Provider value={{ state, dispatch }}>
      {children}
    </CalendarioContexto.Provider>
  );
}

export function useCalendario() {
  const ctx = useContext(CalendarioContexto);
  if (!ctx) {
    throw new Error("useCalendario deve ser usado dentro de CalendarioProvider");
  }
  return ctx;
}

export {
  estadoInicialCalendario,
  reducerCalendario,
};