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
  }
};

/*
export async function systemUpdateCanteiro({
  hortaId,
  canteiroId,
  data,
  systemId = null,
}) {
  if (!hortaId) throw new Error("hortaId é obrigatório");
  if (!canteiroId) throw new Error("canteiroId é obrigatório");

  return db
    .collection("hortas")
    .doc(hortaId)
    .collection("canteiros")
    .doc(canteiroId)
    .update({
      ...data,
      updatedAt: timestamp(),
      version: (data.version || 0) + 1,
      updatedBy: {nome: "sistema", id: systemId}
    });
}
    */