import { db, timestamp } from "../../firebase";

/**
 * Factory de serviços CRUD padronizados
 */
export function createCRUDService(
  collection,
  parentId = null,
  subCollection = null,
  {
    softDelete = true,
    useArchive = true
  } = {}
){
  if (!collection) console.error("createCRUDService: collectionName is required")
  
  const resolveCollection = () => {
    // função customizada
    if (typeof collection === "function") {
      return collection(db);
    }

    // subcoleção
    if (parentId && subCollection) {
      return db
        .collection(collection)
        .doc(parentId)
        .collection(subCollection);
    }

    // coleção raiz
    return db.collection(collection);
  };

  const getCollection = () => {
    const ref = resolveCollection();
    if (!ref) {
      throw new Error("createCRUDService: collection reference not resolved");
    }
    return ref;
  };

  return {
    /**
     * Escuta a coleção (tempo real)
     * @param callback função executada nos dados recebidos
     * @param filters array de objetos com os filtros a serem aplicados na forma { field: "hortaId", op: "==", value: hortaId }
     * @param orderBy objeto com o campo e direção de ordenação na forma {field: "createdAt", dir: "asc" | "desc"}
     */
    subscribe(callback, filters = [], orderBy = null ) { //VERSAO ANTIGA extraQuery = q => q) {  //VERSAO NOVA 
// VERSAO NOVA
      let query = getCollection()
  
      filters.forEach(({ field, op, value }) => {
        query = query.where(field, op, value);
      });
    
      if (orderBy) {
        query = query.orderBy(orderBy.field, orderBy.direction || "asc");
      }
    
      return query.onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
//*/
/* VERSAO ANTIGA
      const col = getCollection();
      return extraQuery(
        col
          .where("isDeleted", "==", false)
      ).onSnapshot(snapshot => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
//*/
        callback(data);
      });
    },

    /**
     * Cria um novo documento
     */
    async create(data, user = { tipo: "usuario", id: "anônimo" },) {
      const col = getCollection();
      return col.add({
        ...data,
        createdAt: timestamp(),
        updatedAt: timestamp(),
        isDeleted: false,
        isArchived: false,
        version: 1,
        createdBy: {nome: user.nome, id: user.id},
        updatedBy: {nome: user.nome, id: user.id}
      });
    },

    /**
     * Atualiza um documento existente
     */
    async update(id, data, user = { tipo: "usuario", id: "anônimo" },) {
      const col = getCollection();
      return col.doc(id).update({
        ...data,
        updatedAt: timestamp(),
        version: (data.version || 0) + 1,
        updatedBy: {nome: user.nome, id: user.id}
      });
    },

    /**
     * Arquivamento lógico
     */
    async archive(id, user = { tipo: "usuario", id: "anônimo" },) {
      if (!useArchive) return;
      const col = getCollection();
      return col.doc(id).update({
        isArchived: true,
        achivedAt: timestamp(),
        updatedAt: timestamp(),
        updatedBy: {nome: user.nome, id: user.id}
      });
    },

    /**
     * Restaura item arquivado
     */
    async restore(id, user = { tipo: "usuario", id: "anônimo" },) {
      const col = getCollection();

      return col.doc(id).update({
        isArchived: false,
        achivedAt: timestamp(),
        updatedAt: timestamp(),
        updatedBy: {nome: user.nome, id: user.id}
      });
    },

    /**
     * Remoção
     * soft delete por padrão
     */
    async remove(id, user = { tipo: "usuario", id: "anônimo" },) {
      if (softDelete) {
        const col = getCollection();
        return col.doc(id).update({
          isDeleted: true,
          deletedAt: timestamp(),
          deletedBy: {nome: user.nome, id: user.id}
        });
      }

      return col.doc(id).delete();
    },

    /**
     * Desremoção
     * soft delete por padrão
     */
    async unremove(id, user = { tipo: "usuario", id: "anônimo" },) {
      if (softDelete) {
        const col = getCollection();
        return col.doc(id).update({
          isDeleted: false,
          deletedAt: timestamp(),
          deletedBy: {nome: user.nome, id: user.id}
        });
      }

      return col.doc(id).delete();
    },


    /**
     * Busca por ID
     */
    async getById(id) {
      const col = getCollection();
      const doc = await col.doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    }
  };
}