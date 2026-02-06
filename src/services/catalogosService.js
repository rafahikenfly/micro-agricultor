import { db } from "../firebase";

let cache = {
  especies: null,
  variedades: null,
  estadosPlanta: null,
  CVJobs: null,
  categorias_especie: null,
  canteiros: null,
  estagios_especie: null,
  estados_planta: null,
  estados_canteiro: null,
  caracteristicas: null,
  manejos: null,
};

const fetchCollection = async (path) => {
  const snap = await db
    .collection(path)
    .where("isDeleted", "==", false)
    .orderBy("nome")
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

const fetchCollectionGroup = async (path) => {
  const snap = await db
    .collectionGroup(path)
    .where("isDeleted", "==", false)
    .orderBy("nome")
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};


export const catalogosService = {
  async getEspecies() {
    if (!cache.especies) {
      cache.especies = await fetchCollection("especies");
    }
    return cache.especies;
  },

  async getVariedades() {
    if (!cache.variedades) {
      cache.variedades = await fetchCollection("variedades");
    }
    return cache.variedades;
  },

  async getEstadosPlanta() {
    if (!cache.estadosPlanta) {
      cache.estadosPlanta = await fetchCollection("estados_planta");
    }
    return cache.estadosPlanta;
  },

  async getCVJobs(filter = null) {
    if (!cache.CVJobs) {
      cache.CVJobs = await fetchCollection("cvJobs");
    }
    if (!filter) return cache.CVJobs;
    return cache.CVJobs.filter(item => item[filter.field] === filter.value);    
  },

  async getCategorias_especie(filter = null) {
    if (!cache.categorias_especie) {
      cache.categorias_especie = await fetchCollection("categorias_especies"); //TODO: AJUSTAR A NOMENCLATURA DA COLECAO
    }
    if (!filter) return cache.categorias_especie;
    return cache.categorias_especie.filter(item => item[filter.field] === filter.value);    
  },

  async getEstagios_especie(filter = null) {
    if (!cache.estagios_especie) {
      cache.estagios_especie = await fetchCollection("estagios_planta");  //TODO: AJUSTAR A NOMENCLATURA DA COLECAO
    }
    if (!filter) return cache.estagios_especie;
    return cache.estagios_especie.filter(item => item[filter.field] === filter.value);    
  },

  async getEstados_planta(filter = null) {
    if (!cache.estados_planta) {
      cache.estados_planta = await fetchCollection("estados_planta");
    }
    if (!filter) return cache.estados_planta;
    return cache.estados_planta.filter(item => item[filter.field] === filter.value);    
  },

  async getEstados_canteiro(filter = null) {
    if (!cache.estados_canteiro) {
      cache.estados_canteiro = await fetchCollection("estados_canteiro");
    }
    if (!filter) return cache.estados_canteiro;
    return cache.estados_canteiro.filter(item => item[filter.field] === filter.value);    
  },

  async getManejos(filter = null) {
    if (!cache.manejos) {
      cache.manejos = await fetchCollection("manejos");
    }
    if (!filter) return cache.manejos;
    return cache.manejos.filter(item => item[filter.field] === filter.value);    
  },

  async getCaracteristicas(filter = null) {
    if (!cache.caracteristicas) {
      cache.caracteristicas = await fetchCollection("caracteristicas");
    }
    if (!filter) return cache.caracteristicas;
    return cache.caracteristicas.filter(item => item[filter.field] === filter.value);    
  },

    async getCanteiros(filter = null) {
    if (!cache.canteiros) {
      cache.canteiros = await fetchCollectionGroup("canteiros");
    }
    if (!filter) return cache.canteiros;
    return cache.canteiros.filter(item => item[filter.field] === filter.value);    
  },

  // útil se um dia precisar forçar reload
  clearCache() {
    cache = { 
      especies: null,
      variedades: null,
      estadosPlanta: null,
      CVJobs: null,
      categorias_especie: null,
      estagios_especie: null,
      estados_planta: null,
      estados_canteiro: null,
      manejos: null,
      caracteristicas: null,
    };
  }
};
