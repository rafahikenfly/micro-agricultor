export const RECORRENCIA = {
    NENHUMA:   {id: "NENHUMA",   nome: "Nenhuma",   prioridade: 8},
    DIARIA:    {id: "DIARIA",    nome: "Diário",    prioridade: 0},
    SEMANAL:   {id: "SEMANAL",   nome: "Semanal",   prioridade: 1},
    QUINZENAL: {id: "QUINZENAL", nome: "Quinzenal", prioridade: 2},
    MENSAL:    {id: "MENSAL",    nome: "Mensal",    prioridade: 3},
    BIMESTRAL: {id: "BIMESTRAL", nome: "Bimestral", prioridade: 4},
    TRIMESTRAL:{id: "TRIMESTRAL",nome: "Trimestral",prioridade: 5},
    SEMESTRAL: {id: "SEMESTRAL", nome: "Semestral", prioridade: 6},
    ANUAL:     {id: "ANUAL",     nome: "Anual",     prioridade: 7},
}

export const RECORRENCIA_FIM = {
    NUNCA: {id: "NUNCA", nome: "Nunca" },
    ATE: {id: "ATE", nome: "Até a data" },
    APOS: {id: "APOS", nome: "Número de execuções" },
}