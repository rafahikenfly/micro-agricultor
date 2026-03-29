export const JOBSTATE_TYPES = {
    PENDING: "pending",
    PROCESSING: "processing",
    ERROR: "error",
    DONE: "done",
}

export const JOBRUN_STATE = {
    [JOBSTATE_TYPES.PENDING]: {id: [JOBSTATE_TYPES.PENDING], nome: "Pendente"},
    [JOBSTATE_TYPES.PROCESSING]: {id: [JOBSTATE_TYPES.PROCESSING], nome: "Processando"},
    [JOBSTATE_TYPES.ERROR]: {id: [JOBSTATE_TYPES.ERROR], nome: "Erro"},
    [JOBSTATE_TYPES.PENDING]: {id: [JOBSTATE_TYPES.PENDING], nome: "Feito"},
}