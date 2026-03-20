//TODO: os Types podem ser bem otimizados aqui se devolverem também uma lista e um mapa (hoje já tem um mapa na prática)
// para isso, eu posso criar uma função utilitária:
/*
const buildStaticCatalog = (map) => ({
  map,
  list: Object.values(map)
});
*/
// que exporta o mapa e a lista, consistente com o catálogo.
// uso da lista (renderOptions e Object.values(catalogo).map) --> AMBIENTE.list.map(a => ...)
// uso do mapa (catalogo.[id]): const ambiente = AMBIENTE.map[tarefa.ambienteId];

export const AMBIENT_TYPES = {
    ADMIN: "admin",
    MAP: "mapa",
    CALENDAR: "calendario",
    DEVELOPER: "dev",
}

export const AMBIENTE = {
    [AMBIENT_TYPES.ADMIN]: {id: AMBIENT_TYPES.ADMIN, nome: "Administrador", tagVariant: "warning", ambiente: "🌱 Painel Administrativo",},
    [AMBIENT_TYPES.MAP]: {id: AMBIENT_TYPES.MAP, nome: "Mapa", tagVariant: "info", ambiente: "🌿 Visualizar Horta",},
    [AMBIENT_TYPES.CALENDAR]: {id: AMBIENT_TYPES.CALENDAR, nome: "Calendário", tagVariant: "info", ambiente: "🌿 Visualizar Calendário",},
    [AMBIENT_TYPES.DEVELOPER]: {id: AMBIENT_TYPES.DEVELOPER, nome: "Desenvolvedor", tagVariant: "dark", ambiente: "🛠️ Ambiente Desenvolvedor",},
}