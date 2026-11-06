import { DISPOSITIVO } from "../types/DISPOSITIVO.js";
import { EVENTO } from "../types/EVENTO.js";
import { movimentarEntidade, redimensionarEntidade } from "./entidade.rules.js";
import { mergeComValidacao } from "./rulesUtils.js";
import { criarTarefa } from "./tarefa.rules.js";

const aparenciaPadrao = {
    fundo: "#900c8b",
    borda: "#d40856",
    espessura: 2,
    geometria: "rect",
    vertices: [],
};
const dispositivoPadrao = {
    aparencia: aparenciaPadrao,
    descricao: "",
    dimensao: { x: 100, y: 100, z: 100 },
    posicao: { x: 0, y: 0, z: 0 },
    descricao: "",
    tipo: "",
    hortaId: "",
    nome: "",
    perifericos: {},
    visivelNoMapa: true,
    editavelNoMapa: true,
};

export const validarDispositivo = (dataObj = {}) => {
    const valid = mergeComValidacao(dispositivoPadrao, dataObj);
    return valid;
}

export function criarDispositivo({ entidade }) {
  const valid = validarDispositivo(entidade);
  // OUTRAS CONDICOES DE CANTEIROS
  return valid;
}
export function movimentarDispositivo({entidade, posicao}) {
  const results = movimentarEntidade({entidade, posicao})
  // OUTRAS CONDICOES DE DISPOSITIVOS
  return results;
}
export function redimensionarDispositivo({entidade, dimensao, posicao}) {
  const results = redimensionarEntidade({entidade, dimensao, posicao})
  // OUTRAS CONDICOES DE DISPOSITIVOS
  return results;
}



export function criarContextoDispositivo({dispositivo, tipoAlvo, entidade, user, onHide=()=>{}, servicesMap={}}) {
  const acoesContexto = [];
  switch (dispositivo.tipo) {
    case DISPOSITIVO.GRBL.id:
      (dispositivo.atuadores ?? [])
        .filter((atuador) => atuador.tipoEntidadeId === tipoAlvo)
        .forEach((atuador)=> {
          acoesContexto.push({
            label: atuador.contextMenuLabel,
            onClick: () => {
              const tarefa = criarTarefa({
                dados: {
                  nome: `${atuador.contextMenuLabel} ${entidade.nome} com ${dispositivo.nome}`,
                },
                contexto: {
                  caracteristicaId: atuador.caracteristicaId,
                  entidadesId: entidade.id,
                  tipoEntidadeId: atuador.tipoEntidadeId,
                  tipoEventoId: EVENTO.MANEJO.id,
                },
              });
              servicesMap.tarefa.create(tarefa, user);
              onHide();
            },
          });
        });
      break;
    default:
      console.error("Tipo de dispositivo desconhecido na criação de menu de contexto");
      break;
  }
  return acoesContexto
}