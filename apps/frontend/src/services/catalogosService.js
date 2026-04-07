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


  async getCVJobSpecs(filter = null) {
    if (!cache.cvJobSpecs) {
      cache.cvJobSpecs = await oldFetchCollection("cvJobSpecs");
    }
    if (!filter) return cache.cvJobSpecs;
    return cache.cvJobSpecs.filter(item => item[filter.field] === filter.value);    
  },


  async getCvModelos(filter = null) {
    if (!cache.cvModelos) {
      cache.cvModelos = await oldFetchCollection("cvModelos");
    }
    if (!filter) return cache.cvModelos;
    return cache.cvModelos.filter(item => item[filter.field] === filter.value);    
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
