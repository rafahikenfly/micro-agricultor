export const RESOLVE_TYPES = {
    CANCELED: "CANCELED",
    MONITOR: "MONITOR", //TODO: DEVERIA SER MONITORED
    HANDLED: "HANDLED",
}

export const RESOLUCAO = {
    [RESOLVE_TYPES.CANCELED]: {id: [RESOLVE_TYPES.CANCELED], nome: "Cancelado"},
    [RESOLVE_TYPES.MONITOR]: {id: [RESOLVE_TYPES.MONITOR], nome: "Monitoramento realizado"},
    [RESOLVE_TYPES.HANDLED]: {id: [RESOLVE_TYPES.HANDLED], nome: "Manejo realizado"}
}