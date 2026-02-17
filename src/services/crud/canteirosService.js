import { createCRUDService } from "@infra/crudFactory";
import { firebaseAdapter } from "./firebaseAdapter";

export const canteirosService = {
  forParent(hortaId) {
    if (!hortaId) console.error("canteirosService.forParent: hortaId é obrigatório");

    return createCRUDService(firebaseAdapter, {
      collection: "hortas",
      parentId: hortaId,
      subCollection: "canteiros",
      softDelete: true,
      useArchive: true,
      collectionGroup: false,
    });
  },
  group() { // TODO: não está dando certo esse grupo
    return createCRUDService({
      collection: "canteiros",
      parentId: null,
      subcollection: null,
      collectionGroup: true,
    });
  },
};