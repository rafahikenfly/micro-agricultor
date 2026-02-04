import { createCRUDService } from "./crudService";
import { db, timestamp } from "../../firebase";

export const plantasService = createCRUDService("plantas");

export async function systemUpdatePlanta(
  plantaId,
  data,
  systemId = null,
) {
  if (!plantaId) throw new Error("plantaId é obrigatório");

  return db
    .collection("plantas")
    .doc(plantaId)
    .update({
      ...data,
      updatedAt: timestamp(),
      version: (data.version || 0) + 1,
      updatedBy: {nome: "sistema", id: systemId}
    });
}