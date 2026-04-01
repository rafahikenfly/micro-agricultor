export const EVENTO_TYPES = {
    CREATE: "CREATE",
}

export const EVENTO = {
  EVOLUCAO: {id: "EVOLUCAO", nome: "Evolução Temporal", categoria: "sistema",  geraNecessidade: false},
  MONITORAMENTO: {id: "MONITORAMENTO", nome:"Monitoramento", categoria: "usuário", geraNecessidade: true},
  MANEJO: {id: "MANEJO", nome: "Manejo", categoria: "usuário", geraNecessidade: true},
  MOVIMENTACAO: {id: "MOVIMENTACAO", nome: "Mover", categoria: "usuário", geraNecessidade: false, path: "posicao"},
  REDIMENSIONAMENTO: {id: "REDIMENSIONAMENTO", nome:"Redimensionamento", categoria: "usuário", geraNecessidade: false},
  DESENHO: {id: "DESENHO", nome: "Desenho", categoria: "usuário", geraNecessidade: false},
  IMPLANTACAO: {id: "IMPLANTACAO", nome: "Implantação", categoria: "usuário", geraNecessidade: false},
  [EVENTO_TYPES.CREATE]: {id: EVENTO_TYPES.CREATE, nome: "Criação", categoria: "entidade", geraNecessidade: false},
};
