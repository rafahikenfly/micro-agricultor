export const EVENTO_TYPES = {
    CREATE: "CREATE",
}

export const EVENTO = {
  EVOLUCAO: {
    id: "EVOLUCAO",
    nome: "Evolução Temporal",
    acao: "Evoluir",
    categoria: "sistema",
    geraNecessidade: false
  },
  MONITORAMENTO: {
    id: "MONITORAMENTO",
    nome:"Monitoramento",
    acao:"Monitorar",
    categoria: "usuário",
    geraNecessidade: true
  },
  MANEJO: {
    id: "MANEJO",
    nome: "Manejo",
    acao: "Manejar",
    categoria: "usuário",
    geraNecessidade: true
  },
  MOVIMENTACAO: {
    id: "MOVIMENTACAO",
    nome: "Movimento",
    acao: "Mover",
    categoria: "usuário",
    geraNecessidade: false, path: "posicao"
  },
  REDIMENSIONAMENTO: {
    id: "REDIMENSIONAMENTO",
    nome:"Redimensionamento",
    acao:"Redimensionar",
    categoria: "usuário",
    geraNecessidade: false
  },
  DESENHO: {
    id: "DESENHO",
    nome: "Desenho",
    acao: "Desenhar",
    categoria: "usuário",
    geraNecessidade: false
  },
  DERIVACAO: {
    id: "DERIVACAO",
    nome: "Derivação",
    acao: "Derivar",
    categoria: "usuário",
    geraNecessidade: false
  },
  [EVENTO_TYPES.CREATE]: {id: EVENTO_TYPES.CREATE, nome: "Criação", categoria: "entidade", geraNecessidade: false},
};
