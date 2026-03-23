import { MIDIA, MIME_TYPES } from "../types";
import { CVRUN_ESTADO, CVRUN_ESTADO_TYPES } from "../types/CVRUN_STATE";
import { mergeComValidacao } from "./rulesUtils";

//TODO: reavaliar esse default de imagem JPEG
const midiaPadrao = {
  nome: "",                           //string
  descricao: "",                      //string
  estado: CVRUN_ESTADO.PENDING.id,    //CVRUN_STATE_TYPES.id
  ultimoRunId: "",
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
    tipoEntidadeNome: "",   //ENTITY_TYPES.nome
    entidadeId: "",         //string
    hortaId: "",            //string
    timestamp: Date.now(),  //epoch
  },

}

export const validarMidia = (dataObj = {}) => {
    const valid = mergeComValidacao(midiaPadrao, dataObj);
    return valid;
}
