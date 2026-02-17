import admin from "firebase-admin";

let db = null;

function getDB() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }

  if (!db) {
    db = admin.firestore();
  }

  return db;
}


export const firebaseAdapter = {
  collection: (name) => getDB().collection(name),
  collectionGroup: (name) => getDB().collectionGroup(name),

  where: (ref, field, op, value) => ref.where(field, op, value),
  orderBy: (ref, field, dir) => ref.orderBy(field, dir),

  onSnapshot: () => {
    throw new Error("onSnapshot não permitido em functions");
  },

  add: (ref, data) => ref.add(data),
  set: (ref, data, opts) => ref.set(data, opts),
  update: (ref, data) => ref.update(data),
  delete: (ref) => ref.delete(),

  now: () => admin.firestore.FieldValue.serverTimestamp(),
  increment: (n) => admin.firestore.FieldValue.increment(n),

  batch: () => getDB().batch(),

};
