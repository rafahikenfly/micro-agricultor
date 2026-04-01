export function createHistoryService(adapter, config) {
  const {
    collection,
    parentId = null,
    subCollection = null,
    collectionGroup = false,
  } = config;

  const resolveCollection = () => {
    if (typeof collection === "function") {
      return collection(adapter);
    }

    if (collectionGroup) {
      return adapter.collectionGroup(collection);
    }

    if (parentId && subCollection) {
      return adapter
        .collection(collection)
        .doc(parentId)
        .collection(subCollection);
    }

    return adapter.collection(collection);
  };

  const getCollection = () => {
    const ref = resolveCollection();
    if (!ref) throw new Error("collection not resolved");
    return ref;
  };

  return {
    // GET
    subscribe(callback, filters = [], orderBy = null) {
      let query = getCollection();

      filters.forEach(f => {
        query = adapter.where(query, f.field, f.op, f.value);
      });

      if (orderBy) {
        query = adapter.orderBy(query, orderBy.field, orderBy.direction || "asc");
      }

      return adapter.onSnapshot(query, snapshot => {
        const data = snapshot.map(d => d);
        callback(data);
      });
    },
    async getDataById(id) {
      if (!id) throw new Error("id é obrigatório em getDataById");

      const col = getCollection();
      const docSnap = await col.doc(id).get();

      if (!docSnap.exists) return null;

      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    },
    getRefById(id) {
      if (!id) throw new Error("id é obrigatório em getRefById");

      const col = getCollection();
      return col.doc(id);
    },
    get(filters = [], orderBy = null) {
      console.log("b",filters)
      let query = getCollection();

      filters.forEach(f => {
        query = adapter.where(query, f.field, f.op, f.value);
      });

      if (orderBy) {
        query = adapter.orderBy(query, orderBy.field, orderBy.direction || "asc");
      }
      return adapter.get(query)
    },


    // SINGLE WRITE
    async append(
      data,
      user = { id: "ND", nome: "ND" }
    ) {
      const col = getCollection();

      return adapter.add(col, {
        ...data,
        persistedAt: adapter.now(),
        persistedBy: {
          id: user.uid,
          nome: user.nome,
        },
      });
    },

    getAppendRef(id = null) {
      const col = getCollection();
      return id ? col.doc(id) : col.doc();
    },

    // BATCH WRITE
    batchAppend(data, user, batch ) {
      if (!batch) throw new Error("batch é obrigatório em batchCreate");

      const col = getCollection();
      const docRef = col.doc();

      batch.set(docRef, {
        ...data,
        persistedAt: adapter.now(),
        persistedBy: {
          id: user.uid,
          nome: user.nome,
        },
      });

      return docRef;
    },
    batchUpsert (docRef, data, user, batch ) {
      if (!batch) throw new Error("batch é obrigatório em batchUpsert");

      batch.set(docRef, {
        ...data,
        persistedAt: adapter.now(),
        persistedBy:{
          id: user.uid,
          nome: user.nome,
        },
      }, { merge: true });
    },


  };
}