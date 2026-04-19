import { ESTADO_TAREFA, MIDIA, MIME_TYPES } from "../types/index.js";
import { mergeComValidacao } from "./rulesUtils.js";

//TODO: reavaliar esse default de imagem JPEG
const midiaPadrao = {
  nome: "",                           //string
  descricao: "",                      //string
  estado: ESTADO_TAREFA.PENDENTE.id,   //ESTADO_TAREFA[].id
  tipoMediaId: MIDIA.CAPTURA.id,      //MEDIA_TYPES.id
  mimeType: MIME_TYPES.JPEG.nome,          //MIME_TYPES.mime
  metadados: {
    anotada: false,
    bytes: 0,
    largura: 0,
    altura: 0,
    // localização
    url: "",                //url para renderização
    storagePath: "",
  },
  contexto: {
    tipoEntidadeId: "",     //ENTITY_TYPES.id
    entidadeId: "",         //string
    hortaId: "",            //string
    timestamp: Date.now(),  //epoch
  },
  execucao: null,
  //{
  //  adquiridaEm: 0,
  //  adquiridaAte: 0,
  //  iniciadoEm: 0,
  //  finalizadoEm: 0,
  //  tentativas: 0,
  //  ultimoErro: "",
  //  maxTentativas: 3,
  //  agente: {
  //    tipo: "",
  //    id: "",
  //  },
  //}
  inferencia: null
// processada: false,
// modelosId: [],
// resultados: {}, // bounding boxes, labels, etc.
// confiancaMedia: null,
}

export const validarMidia = (dataObj = {}) => {
    const valid = mergeComValidacao(midiaPadrao, dataObj);
    return valid;
}
