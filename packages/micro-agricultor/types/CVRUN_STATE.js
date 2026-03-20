export const CVRUN_ESTADO_TYPES = {
    PENDING: "pending",
    PROCESSING: "processing",
    ERROR: "error",
    DONE: "done",
}

export const CVRUN_ESTADO = {
    [CVRUN_ESTADO_TYPES.PENDING]: {id: CVRUN_ESTADO_TYPES.PENDING, nome: "Pendente"},
    [CVRUN_ESTADO_TYPES.PROCESSING]: {id: CVRUN_ESTADO_TYPES.PROCESSING, nome: "Processando"},
    [CVRUN_ESTADO_TYPES.ERROR]: {id: CVRUN_ESTADO_TYPES.ERROR, nome: "Erro"},
    [CVRUN_ESTADO_TYPES.DONE]: {id: CVRUN_ESTADO_TYPES.DONE, nome: "Feito"},
}