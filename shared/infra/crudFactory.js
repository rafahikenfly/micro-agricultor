export function createCRUDService(adapter, config) {
  const {
    collection,
    parentId = null,
    subCollection = null,
    softDelete = true,
    useArchive = true,
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

    async create(data, user) {
      const col = getCollection();
      return adapter.add(col, {
        ...data,
        createdAt: adapter.now(),
        updatedAt: adapter.now(),
        isDeleted: false,
        isArchived: false,
        version: 1,
        createdBy: {id: user.id, nome: user.nome},
        updatedBy: {id: user.id, nome: user.nome},
      });
    },
    criarRef(id = null) {
      const col = getCollection();
      return id ? col.doc(id) : col.doc();
    },
    batchCreate (
      data,
      user = { id: "anonimo", nome: "anônimo" },
      batch
    ) {
      if (!batch) throw new Error("batch é obrigatório em batchCreate");

      const col = getCollection();
      const docRef = col.doc();

      batch.set(docRef, {
        ...data,
        createdAt: adapter.now(),
        updatedAt: adapter.now(),
        isDeleted: false,
        isArchived: false,
        version: 1,
        createdBy: { nome: user.nome, id: user.id },
        updatedBy: { nome: user.nome, id: user.id },
      });

      return docRef;
    },
    async upsert (
      docRef,
      data,
      user = { id: "anonimo", nome: "anônimo" },
    ) {
      return adapter.set(docRef, {
        ...data,
        createdAt: adapter.now(),
        createdBy: { nome: user.nome, id: user.id },
        updatedAt: adapter.now(),
        updatedBy: { nome: user.nome, id: user.id },
        isDeleted: false,
        isArchived: false,
        version: adapter.increment(1),
      }, { merge: true });
    },

    async update(ref, data, user) {
      return adapter.update(ref, {
        ...data,
        updatedAt: adapter.now(),
        version: adapter.increment(1),
        updatedBy: {id: user.id, nome: user.nome},
      });
    },
    batchUpsert (
      docRef,
      data,
      user = { id: "anonimo", nome: "anônimo" },
      batch
    ) {
      if (!batch) throw new Error("batch é obrigatório em batchUpsert");

      batch.set(docRef, {
        ...data,
        createdAt: adapter.now(),
        createdBy: { nome: user.nome, id: user.id },
        updatedAt: adapter.now(),
        updatedBy: { nome: user.nome, id: user.id },
        isDeleted: false,
        isArchived: false,
        version: adapter.increment(1),
      }, { merge: true });
    },
    batchUpdate (
      docRef,
      data,
      user,
      batch
    ) {
      if (!batch) throw new Error("batch é obrigatório em batchUpdate");

      batch.update(docRef, {
        ...data,
        updatedAt: adapter.now(),
        version: adapter.increment(1),
        updatedBy: { nome: user.nome, id: user.id }
      });

      return docRef;
    },


    async remove(ref, user) {
      if (!softDelete) return adapter.delete(ref);

      return adapter.update(ref, {
        isDeleted: true,
        deletedAt: adapter.now(),
        deletedBy: {id: user.id, nome: user.nome},
      });
    },

    async getDataById (id) {
      if (!id) throw new Error("id é obrigatório em getDataById");

      const col = getCollection();
      const docSnap = await col.doc(id).get();

      if (!docSnap.exists) return null;

      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    },
    getRefById (id) {
      if (!id) throw new Error("id é obrigatório em getRefById");

      const col = getCollection();
      return col.doc(id);
    },
  };
}
