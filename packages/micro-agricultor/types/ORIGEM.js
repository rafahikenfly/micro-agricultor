export const ORIGEM_TYPES = {
    USER: "USER",
    BACKEND: "BACKEND",
    CVWORKER: "CVWORKER",
    FRONTEND: "FRONTEND,"
}

export const ORIGEM = {
    [ORIGEM_TYPES.USER]: {id: ORIGEM_TYPES.USER, nome: "Usuário"},
    [ORIGEM_TYPES.BACKEND]: {id: ORIGEM_TYPES.BACKEND, nome: "Backend"},
    [ORIGEM_TYPES.CVWORKER]: {id: ORIGEM_TYPES.CVWORKER, nome: "Visão Computacional"},
    [ORIGEM_TYPES.FRONTEND]: {id: ORIGEM_TYPES.FRONTEND, nome: "Frontend"},
}