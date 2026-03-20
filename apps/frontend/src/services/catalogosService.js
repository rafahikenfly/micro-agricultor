// TODO: implementar cache de list e map
// Problema para isso: todos os usos de catálogo atuais precisam ser revistos e usar aquele que é mais
// eficiente. Isso vai ser importante quando tiver 1000 entidades!
// ---> ver comentário em AMBIENT_TYPES
// A ideia é:

/* FETCH COLLECTION MUDA PARA ALGO DO TIPO
const fetchCollection = async (path) => {
  const snap = await db
    .collection(path)
    .where("isDeleted", "==", false)
    .orderBy("nome")
    .get();

  const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const map = new Map(list.map(item => [item.id, item]));

  return { list, map };
 };
*/

/* getCatalogo retorna algo do tipo:
cache.plantas = {
  list: [...],
  map: Map(...)
}
*/

// Em listagens (renderOption, array.map), usa o array: const plantas = (await catalogosService.getPlantas()).list;
// Em buscas por id, ao invés do array.find, usa o map: const planta = (await catalogosService.getPlantas()).map.get(plantaId);

import { db } from "../firebase";

let cache = {};

const fetchCollection = async (path, useHistory) => {
  const snap = useHistory ? 
    await db
      .collection(path)
      .orderBy("timestamp")
      .get()
  : await db
    .collection(path)
    .where("isDeleted", "==", false)
    .orderBy("nome")
    .get();

  const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const map = new Map(list.map(item => [item.id, item]));

  return { list, map };
};

const getCatalog = async (key, path, useHistory = false, filter = null) => {
  if (!cache[key]) {
    cache[key] = await fetchCollection(path, useHistory);
  }

  if (!filter) return cache[key];

  const filters = Array.isArray(filter) ? filter : [filter];

  return cache[key].list.filter(item =>
    filters.every(f => item[f.field] === f.value)
  );
};

const oldFetchCollection = async (path) => {
  const snap = await db
    .collection(path)
    .where("isDeleted", "==", false)
    .orderBy("nome")
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

const oldFetchCollectionGroup = async (path) => {
  const snap = await db
    .collectionGroup(path)
    .where("isDeleted", "==", false)
    .orderBy("nome")
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};


export const catalogosService = {

  getPlantas: (useHistory = false, filter = null) => getCatalog("plantas", "plantas", useHistory, filter),
  getCanteiros: (useHistory = false, filter = null) => getCatalog("canteiros", "canteiros", useHistory, filter),
  getCaracteristicas: (useHistory = false, filter = null) => getCatalog("caracteristicas", "caracteristicas", useHistory, filter),
  getMidias: (useHistory = false, filter = null) => getCatalog("midias", "midias", useHistory, filter),
  getEfeitos: (useHistory = true, filter = null) => getCatalog("efeitos", "historicoEfeitos", useHistory, filter),
  getEventos: (useHistory = true, filter = null) => getCatalog("eventos", "eventos", useHistory, filter),


  async getEspecies() {
    if (!cache.especies) {
      cache.especies = await oldFetchCollection("especies");
    }
    return cache.especies;
  },

  async getVariedades() {
    if (!cache.variedades) {
      cache.variedades = await oldFetchCollection("variedades");
    }
    return cache.variedades;
  },

  async getEstadosPlanta() {
    if (!cache.estadosPlanta) {
      cache.estadosPlanta = await oldFetchCollection("estados_planta");
    }
    return cache.estadosPlanta;
  },

  async getCVJobSpecs(filter = null) {
    if (!cache.cvJobSpecs) {
      cache.cvJobSpecs = await oldFetchCollection("cvJobSpecs");
    }
    if (!filter) return cache.cvJobSpecs;
    return cache.cvJobSpecs.filter(item => item[filter.field] === filter.value);    
  },

  async getCategorias_especie(filter = null) {
    if (!cache.categorias_especie) {
      cache.categorias_especie = await oldFetchCollection("categorias_especies"); //TODO: AJUSTAR A NOMENCLATURA DA COLECAO
    }
    if (!filter) return cache.categorias_especie;
    return cache.categorias_especie.filter(item => item[filter.field] === filter.value);    
  },

  async getEstagios_especie(filter = null) {
    if (!cache.estagios_especie) {
      cache.estagios_especie = await oldFetchCollection("estagios_planta");  //TODO: AJUSTAR A NOMENCLATURA DA COLECAO
    }
    if (!filter) return cache.estagios_especie;
    return cache.estagios_especie.filter(item => item[filter.field] === filter.value);    
  },

  async getEstados_planta(filter = null) {
    if (!cache.estados_planta) {
      cache.estados_planta = await oldFetchCollection("estados_planta");
    }
    if (!filter) return cache.estados_planta;
    return cache.estados_planta.filter(item => item[filter.field] === filter.value);    
  },

  async getEstados_canteiro(filter = null) {
    if (!cache.estados_canteiro) {
      cache.estados_canteiro = await oldFetchCollection("estados_canteiro");
    }
    if (!filter) return cache.estados_canteiro;
    return cache.estados_canteiro.filter(item => item[filter.field] === filter.value);    
  },

  async getManejos(filter = null) {
    if (!cache.manejos) {
      cache.manejos = await oldFetchCollection("manejos");
    }
    if (!filter) return cache.manejos;
    return cache.manejos.filter(item => item[filter.field] === filter.value);    
  },


  async getCvModelos(filter = null) {
    if (!cache.cvModelos) {
      cache.cvModelos = await oldFetchCollection("cvModelos");
    }
    if (!filter) return cache.cvModelos;
    return cache.cvModelos.filter(item => item[filter.field] === filter.value);    
  },
/* 

  async getCaracteristicas(filter = null) {
    if (!cache.caracteristicas) {
      cache.caracteristicas = await oldFetchCollection("caracteristicas");
    }
    if (!filter) return cache.caracteristicas;
    return cache.caracteristicas.filter(item => item[filter.field] === filter.value);    
  },

  async getPlantas(filter = null) {
    if (!cache.plantas) {
      cache.plantas = await oldFetchCollection("plantas");
    }
    if (!filter) return cache.plantas;
    return cache.plantas.filter(item => item[filter.field] === filter.value);    
  },


  async getCanteiros(filter = null) {
    if (!cache.canteiros) {
      cache.canteiros = await oldFetchCollection("canteiros");
    }
    if (!filter) return cache.canteiros;
    return cache.canteiros.filter(item => item[filter.field] === filter.value);    
  }, */

  async getHortas(filter = null) {
    if (!cache.hortas) {
      cache.hortas = await oldFetchCollection("hortas");
    }
    if (!filter) return cache.hortas;
    return cache.hortas.filter(item => item[filter.field] === filter.value);    
  },

  async getTarefas(filter = null) {
    if (!cache.tarefas) {
      cache.tarefas = await oldFetchCollection("tarefas");
    }
    if (!filter) return cache.tarefas;
    return cache.tarefas.filter(item => item[filter.field] === filter.value);    
  },

  async getUsuarios(filter = null) {
    if (!cache.usuarios) {
      cache.usuarios = await oldFetchCollection("usuarios");
    }
    if (!filter) return cache.usuarios;
    return cache.usuarios.filter(item => item[filter.field] === filter.value);    
  },

  clearCache(key) {
    if (!key) {
      cache = {};
      return;
    }

    if (cache[key]) {
      delete cache[key];
    }
  },

  hasCache(key) {
    return !!cache[key]
  }
};
