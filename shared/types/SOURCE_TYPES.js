export const SOURCE_TYPES = {
    USER: "usuario",
    FUNCTIONS: "firebase functions",
    CVWORKER: "cv worker",
}

export const SOURCE = {
    [SOURCE_TYPES.USER]: {id: SOURCE_TYPES.USER, nome: "Usuário"},
    [SOURCE_TYPES.FUNCTIONS]: {id: SOURCE_TYPES.FUNCTIONS, nome: "Firebase Functions"},
    [SOURCE_TYPES.CVWORKER]: {id: SOURCE_TYPES.CVWORKER, nome: "Visão Computacional"},
}