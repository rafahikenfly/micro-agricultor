import { db, increment, timestamp } from "../../firebase";

export const firebaseAdapter = {
  collection: (name) => db.collection(name),
  collectionGroup: (name) => db.collectionGroup(name),

  where: (ref, field, op, value) => ref.where(field, op, value),
  orderBy: (ref, field, dir) => ref.orderBy(field, dir),

  onSnapshot: (ref, cb) =>
    ref.onSnapshot(snap => {
      cb(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }),

  add: (ref, data) => ref.add(data),
  set: (ref, data, opts) => ref.set(data, opts),
  update: (ref, data) => ref.update(data),
  delete: (ref) => ref.delete(),

  now: () => timestamp(),
  increment: (n) => increment(n),

  batch: () => db.batch(),

};
