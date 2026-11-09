import { DISPOSITIVO } from "../types/DISPOSITIVO.js";
import { EVENTO, EVENTO_TYPES } from "../types/EVENTO.js";
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
    atuadores: [],
    descricao: "",
    dimensao: { x: 100, y: 100, z: 100 },
    editavelNoMapa: true,
    hortaId: "",
    nome: "",
    posicao: { x: 0, y: 0, z: 0 },
    telemetria: {},
    tipo: "",
    visivelNoMapa: true,
};

export const validarDispositivo = (dataObj = {}) => {
    const valid = mergeComValidacao(dispositivoPadrao, dataObj);
    return valid;
}

export function criarDispositivo({ entidade }) {
  const valid = validarDispositivo(entidade);
  // OUTRAS CONDICOES DE DISPOSITIVOS
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



export function criarContextoDispositivo({dispositivo, tipoAlvo, entidade, user, servicesMap={}, onHide=()=>{}}) {
  const acoesContexto = [];
  switch (dispositivo.tipo) {
    case DISPOSITIVO.GRBL.id:
      (dispositivo.atuadores ?? [])
        .filter((atuador) => atuador.tipoEntidadeId === tipoAlvo)
        .forEach((atuador)=> {
          acoesContexto.push({
            label: atuador.contextMenuLabel,
            onClick: () => {
              if (!atuador.macroId) console.info(`Atuador ${atuador.contextMenuLabel} não possui macroId definido.`);
              const tarefa = criarTarefa({
                dados: {
                  nome: `${atuador.contextMenuLabel} ${entidade.nome} com ${dispositivo.nome}`,
                },
                contexto: {
                  caracteristicaId: atuador.caracteristicaId,
                  entidadesId: [entidade.id],
                  tipoEntidadeId: atuador.tipoEntidadeId,
                  tipoEventoId: EVENTO.MANEJO.id,
                  macroId: atuador.macroId || "",
                },
                execucao: {
                  agente: {
                    id: dispositivo.id,
                    tipo: DISPOSITIVO.GRBL.id,
                  }
                }
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
export function indiceCapaz({dispositivo, tarefa}) {
  let indice = -1;
  if (tarefa.contexto.tipoEventoId === EVENTO_TYPES.MANEJO.id) {
    // Busca o índice do atuador correspondente no GrblCNC capaz de rodar a macro
    indice = dispositivo.atuadores.findIndex(
        a => a.caracteristicaId === tarefa.contexto.caracteristicaId
    );
  }
  if (tarefa.contexto.tipoEventoId === EVENTO_TYPES.MONITORAMENTO.id) {
    // Busca o índice do sensor correspondente no GrblCNC capaz de rodar a macro
    indice = dispositivo.sensores.findIndex(
        a => a.caracteristicaId === tarefa.contexto.caracteristicaId
    );
  }
  return indice;
}
export function entidadesAoAlcance({dispositivo, entidades}) {
  const alcanceX = dispositivo.dimensao.x / 2;
  const alcanceY = dispositivo.dimensao.y / 2;
  const alcanceZ = dispositivo.dimensao.z;

  return entidades.filter(ent => {
    if (!ent || !ent.posicao) return false;

    const noAlcanceX = alcanceX > Math.abs(ent.posicao.x - dispositivo.posicao.x);
    const noAlcanceY = alcanceY > Math.abs(ent.posicao.y - dispositivo.posicao.y);
    const noAlcanceZ = alcanceZ > ent.posicao.z + ent.dimensao.z - dispositivo.posicao.z;

    return noAlcanceX && noAlcanceY && noAlcanceZ;
  });
}