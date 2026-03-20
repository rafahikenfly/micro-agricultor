export const EVENTO_TYPES = {
    RESIZE: "resize",
    CREATE: "create",
    MONITOR: "monitor",
    HANDLE: "handle",
    TIME: "time",
}

export const EVENTO = {
  [EVENTO_TYPES.RESIZE]: {id: EVENTO_TYPES.RESIZE, nome:"Redimensionamento", categoria: "entidade", geraNecessidade: false},
  [EVENTO_TYPES.CREATE]: {id: EVENTO_TYPES.CREATE, nome: "Criação", categoria: "entidade", geraNecessidade: false},
  [EVENTO_TYPES.MONITOR]: {id: EVENTO_TYPES.MONITOR, nome:"Monitoramento", categoria: "usuário", geraNecessidade: true},
  [EVENTO_TYPES.HANDLE]: {id: EVENTO_TYPES.HANDLE, nome: "Manejo", categoria: "usuário", geraNecessidade: true},
  [EVENTO_TYPES.TIME]: {id: EVENTO_TYPES.TIME, nome: "Tempo Decorrido", categoria: "sistema",  geraNecessidade: false}  ,
};
