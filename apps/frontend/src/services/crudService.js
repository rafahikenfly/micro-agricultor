import { createCRUDService } from "micro-agricultor";
import { firebaseAdapter } from "./crud/firebaseAdapter";

export const plantasService = createCRUDService (firebaseAdapter, {
  collection: "plantas",
  softDelete: true,
  useArchive: true,
});

export const canteirosService = createCRUDService (firebaseAdapter, {
  collection: "canteiros",
  softDelete: true,
  useArchive: true,
});

export const hortasService = createCRUDService (firebaseAdapter, {
  collection: "hortas",
  softDelete: true,
  useArchive: true,
});

export const caracteristicasService = createCRUDService (firebaseAdapter, {
  collection: "caracteristicas",
  softDelete: true,
  useArchive: true,
});

export const manejosService = createCRUDService (firebaseAdapter, {
  collection: "manejos",
  softDelete: true,
  useArchive: true,
});

export const especiesService = createCRUDService (firebaseAdapter, {
  collection: "especies",
  softDelete: true,
  useArchive: true,
});

export const variedadesService = createCRUDService (firebaseAdapter, {
  collection: "variedades",
  softDelete: true,
  useArchive: true,
});

export const midiasService = createCRUDService (firebaseAdapter, {
  collection: "midias",
  softDelete: true,
  useArchive: true,
});

export const estadosCanteiroService = createCRUDService (firebaseAdapter, {
  collection: "estados_canteiro",
  softDelete: true,
  useArchive: true,
});

export const estadosPlantaService = createCRUDService (firebaseAdapter, {
  collection: "estados_planta",
  softDelete: true,
  useArchive: true,
});

export const estagiosEspecieService = createCRUDService (firebaseAdapter, {
  collection: "estagios_planta", //TODO: ARRUMAR CHAVE DO DATABASE
  softDelete: true,
  useArchive: true,
});

export const tarefasService = createCRUDService (firebaseAdapter, {
  collection: "tarefas",
  softDelete: true,
  useArchive: true,
});

export const usuariosService = createCRUDService (firebaseAdapter, {
  collection: "usuarios",
  softDelete: true,
  useArchive: true,
});

export const categoriasEspecieService = createCRUDService (firebaseAdapter, {
  collection: "categorias_especies", //TODO: ARRUMAR CHAVE DO DATABASE
  softDelete: true,
  useArchive: true,
});

export const necessidadesService = createCRUDService (firebaseAdapter, {
  collection: "necessidades",
  softDelete: true,
  useArchive: true,
});

export const dispositivosService = createCRUDService (firebaseAdapter, {
  collection: "dispositivos",
  softDelete: true,
  useArchive: true,
});



// ===== DERIVED =====
export function entidadeService({ tipoEntidadeId }) {
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
