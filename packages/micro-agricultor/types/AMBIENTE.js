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

import { VARIANTE } from "./VARIANTE.js"


export const AMBIENTE = {
    admin: {id: "admin", nome: "Administrador", variant: VARIANTE.YELLOW.id, ambiente: "🌱 Painel Administrativo",},
    mapa: {id: "mapa", nome: "Mapa", variant: VARIANTE.LIGHTBLUE.id, ambiente: "🌿 Visualizar Horta",},
    calendario: {id: "calendario", nome: "Calendário", variant: VARIANTE.RED.id, ambiente: "🌿 Visualizar Calendário",},
    dev: {id: "dev", nome: "Desenvolvedor", variant: VARIANTE.GREY.id, ambiente: "🛠️ Ambiente Desenvolvedor",},
}