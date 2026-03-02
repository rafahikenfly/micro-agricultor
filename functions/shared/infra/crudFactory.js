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

    // SINGLE OPERATIONS
    async create(data, user) {
      const col = getCollection();
      return adapter.add(col, {
        ...data,
        createdAt: adapter.now(),
        updatedAt: adapter.now(),
        isDeleted: false,
        isArchived: false,
        version: 1,
        createdBy: {uid: user.uid, nome: user.nome},
        updatedBy: {uid: user.uid, nome: user.nome},
      });
    },
    async upsert (
      docRef,
      data,
      user = { uid: "anonimo", nome: "anônimo" },
    ) {
      return adapter.set(docRef, {
        ...data,
        createdAt: adapter.now(),
        createdBy: { nome: user.nome, uid: user.uid },
        updatedAt: adapter.now(),
        updatedBy: { nome: user.nome, uid: user.uid },
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
        updatedBy: {uid: user.uid, nome: user.nome},
      });
    },
    async remove(ref, user) {
      if (!softDelete) return adapter.delete(ref);

      return adapter.update(ref, {
        isDeleted: true,
        deletedAt: adapter.now(),
        deletedBy: {uid: user.uid, nome: user.nome},
      });
    },
    async restore(ref, user) {
      if (!softDelete) return
      return adapter.update(ref, {
        isDeleted: false,
        deletedAt: adapter.now(),
        deletedBy: {uid: user.uid, nome: user.nome},
      });
    },
    async archive(ref, user) {
      if (!useArchive) return
      return adapter.update(ref, {
        isArchived: true,
        archivedAt: adapter.now(),
        archivedBy: {uid: user.uid, nome: user.nome},
      });
    },
    async unarchive(ref, user) {
      if (!useArchive) return
      return adapter.update(ref, {
        isArchived: false,
        archivedAt: adapter.now(),
        archivedBy: {uid: user.uid, nome: user.nome},
      });
    },

    // BATCH
    getCreateRef(id = null) { //TODO: renomear para getCreateRef
      const col = getCollection();
      return id ? col.doc(id) : col.doc();
    },
    batchCreate (
      data,
      user,
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
        createdBy: { nome: user.nome, uid: user.uid },
        updatedBy: { nome: user.nome, uid: user.uid },
      });

      return docRef;
    },
    batchUpsert (
      docRef,
      data,
      user,
      batch
    ) {
      if (!batch) throw new Error("batch é obrigatório em batchUpsert");

      batch.set(docRef, {
        ...data,
        createdAt: adapter.now(),
        createdBy: { nome: user.nome, uid: user.uid },
        updatedAt: adapter.now(),
        updatedBy: { nome: user.nome, uid: user.uid },
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
        updatedBy: { nome: user.nome, uid: user.uid }
      });

      return docRef;
    },
    //TODO: Batch remove, restore, archive, unarchive

    async getDataById (id) {
      if (!id) throw new Error("id é obrigatório em getDataById");

      const col = getCollection();
      const docSnap = await col.doc(id).get();

      if (!docSnap.exists) return null;

      return {
        uid: docSnap.id,
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
