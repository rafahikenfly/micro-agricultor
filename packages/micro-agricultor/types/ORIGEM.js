export const ORIGEM_TYPES = {
    CVWORKER: "CVWORKER",
}

export const ORIGEM = {
    USER: {id: "USER", nome: "Usuário"},
    BACKEND: {id: "BACKEND", nome: "Backend"},
    [ORIGEM_TYPES.CVWORKER]: {id: ORIGEM_TYPES.CVWORKER, nome: "Visão Computacional"},
    FRONTEND: {id: "FRONTEND", nome: "Frontend"},
}