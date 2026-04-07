import React, { createContext, useContext, useReducer } from "react";

const CalendarioContexto = createContext(null);

export const ACOES_CALENDARIO = {
  SET_MODO: "SET_MODO",
  SET_INICIO: "SET_INICIO",
  SETSHOW_MODAL: "SETSHOW_MODAL",
  SETSHOW_EVENTOS: "SETSHOW_EVENTOS",
  SETSHOW_TAREFAS: "SETSHOW_TAREFAS",
  
  SET_TAMANHO: "SET_TAMANHO",
  SET_FILTROS: "SET_FILTROS",
  SELECT_ITEM: "SELECT_ITEM",
  CLEAR_SELECTION: "CLEAR_SELECTION",
};

const estadoInicialCalendario = {
  modo: "mes", // "agenda" | "dia" | "semana" | "mes"
  inicio: new Date(),

  intervalo: {
    fim: new Date(),
    tamanho: "semana", // 
  },

  hortasSelecionadas: ["4NbaiMkpR9CRIizDdfQ9"],

//  filtros: {
//    categoriasEvento: [],   // natural, humano...
//    statusTarefa: [],       // pendente, concluida...
//  },

  show: {
    modal: false,
    eventos: true,
    tarefas: false,
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
        inicio: action.payload
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
    case ACOES_CALENDARIO.SETSHOW_MODAL:
      return {
        ...state,
        show: {
          ...state.show,
          modal: action.payload,
        }
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