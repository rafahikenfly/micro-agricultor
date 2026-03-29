export const EVENTO_TYPES = {
  RESIZE: "resize",
  CREATE: "create",
  MONITOR: "monitor",
  HANDLE: "handle",
  TIME: "time",
}

export const EVENTO = {
  resize: {id: "entidadeRedimensionada", nome:"Redimensionamento", categoria: "entidade"},
  create: {id: "entidadeCriada", nome: "Criação", categoria: "entidade"},
  monitor: {id: "monitoramentoManual", nome:"Monitoramento", categoria: "usuário"},
  handle: {id: "manejo", nome: "Manejo", categoria: "usuário"},
  time: { id: "tempoDecorrido", nome: "Tempo Decorrido", categoria: "sistema" }  ,
};
