import { DISPOSITIVO } from "../types/DISPOSITIVO.js";
import { EFEITO } from "../types/EFEITOS.js";
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
    sensores: [],
    telemetria: {},
    tipo: "",
    visivelNoMapa: true,
};
const ferramentaPadrao = {
  ativo: false,
  nome: "Nova ferramenta",
  tipoFerramentaId: "",
  tipoEventoId: EVENTO.MONITORAMENTO.id,
  efeito: EFEITO.NENHUM.id,
  caracteristicaId: "",
  indiceFerramenta: "",
  aplicavel: {},
  usarMover: false,
  usarParametro: false,
  parametros: {},
  usarMenuContexto: false,
  nomeAcao: "",
  usarMacro: false,
  macroId: "",
  usarTroca: false,
  indiceTroca: "",
}

export const validarDispositivo = (dataObj = {}) => {
  const valid = mergeComValidacao(dispositivoPadrao, dataObj);
  if (Array.isArray(valid.ferramentas)) {
    valid.sensores = valid.sensores.map(f => mergeComValidacao(ferramentaPadrao, f));
  }
  return valid;
};

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



export function criarContextoDispositivo({dispositivo, tipoAlvo, entidadesId, user, servicesMap={}, onHide=()=>{}}) {
  const acoesContexto = [];
  (dispositivo.ferramentas ?? [])
    .filter((ferr) => ferr.usarMenuContexto)
    .filter((ferr) => ferr.aplicavel[tipoAlvo])
    .forEach((ferr)=> {
      acoesContexto.push({
        label: ferr.nomeAcao,
        onClick: () => {
          const tarefa = criarTarefa({
            dados: {
              nome: `${ferr.nomeAcao} com ${dispositivo.nome}.`,
            },
            descricao: `${ferr.nomeAcao} ${entidadesId.length} ${tipoAlvo}, usando ${ferr.nome} (${ferr.indiceFerramenta}) de ${dispositivo.nome}`,
            contexto: {
              caracteristicaId: ferr.caracteristicaId,
              entidadesId: entidadesId,
              tipoEntidadeId: ferr.tipoEntidadeId,
              tipoEventoId: ferr.tipoEventoId,
            },
            execucao: {
              agente: {
                id: dispositivo.id,
                tipo: dispositivo.tipo,
              }
            }
          });
          servicesMap.tarefa.create(tarefa, user);
          onHide();
        },
      });
    });
  return acoesContexto
}
export function ferramentaCapaz({dispositivo, tarefa}) {
  return ferr = dispositivo.ferramentas.find(
    ferr => {
      ferr.ativo &&                                               // Ferramenta ativa
      ferr.tipoEventoId === tarefa.contexto.tipoEventoId &&       // Adequada ao tipo de evento
      ferr.aplicavel[tarefa.contexto.tipoEntidadeId] &&           // Aplicável ao tipo de entidade
      ferr.caracteristicaId === tarefa.contexto.caracteristicaId  // Aplicável à característica alvo
    }
  )
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