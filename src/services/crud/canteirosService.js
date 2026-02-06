//import { db, timestamp } from "../../firebase";
import { createCRUDService } from "./crudService";

export const canteirosService = {
  forParent(hortaId) {
    if (!hortaId) {
      console.error("canteirosService.forParent: hortaId é obrigatório");
    }

    return createCRUDService(
      "hortas",      // coleção pai
      hortaId,       // id do documento pai
      "canteiros"    // subcoleção
    );
  },
  group() {
    return createCRUDService(
      "canteiros",
      null,
      null,
      { collectionGroup: true }
    );
  }

};