export const RULES_TYPES = {
    AMBIENTE: "ambiente",
    TAREFA: "tarefa",
    TRANSICAO: "transicao",
}
export const REGRA = {
    [RULES_TYPES.AMBIENTE]: {id: RULES_TYPES.AMBIENTE, nome: "Ambiente"},
    [RULES_TYPES.TAREFA]: {id: RULES_TYPES.TAREFA, nome: "Tarefa"},
    [RULES_TYPES.TRANSICAO]: {id: RULES_TYPES.TRANSICAO, nome: "Transição"},
}