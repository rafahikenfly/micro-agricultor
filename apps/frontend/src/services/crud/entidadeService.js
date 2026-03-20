// services/resolveEntidadeService.js

import { canteirosService } from "./canteirosService";
import { hortaService } from "./hortaService";
import { plantasService } from "./plantasService";

export function entidadeService({
  tipoEntidadeId
}) {
  switch (tipoEntidadeId) {

    case "canteiro": 
      return canteirosService;

    case "planta":
      return plantasService;

    case "horta":
      return hortaService; //TODO: horta"S"Service

    default:
      throw new Error(`Tipo de entidade não suportado: ${tipoEntidadeId}`);
  }
}
