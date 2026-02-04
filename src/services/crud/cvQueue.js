import { db, timestamp } from "../../firebase";
import { createCRUDService } from "./crudService";

export const cvQueueService = createCRUDService("cvQueue");

export const systemCreateCVJob = async (data, systemId = null) => {
  return db
    .collection("cvQueue")
    .add({
      ...data,
      createdAt: timestamp(),
      createdBy: {nome: "sistema", id: systemId},
      updatedAt: timestamp(),
      updatedBy: {nome: "sistema", id: systemId},
      isDeleted: false,
      isArchived: false,
      version: 1,
    });
};    