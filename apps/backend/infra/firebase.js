import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("./serviceKey.json", import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "micro-agricultor.firebasestorage.app",
});

export const db = admin.firestore();
export const storage = admin.storage();
export const timestamp = admin.firestore.FieldValue.serverTimestamp;
export const increment = admin.firestore.FieldValue.increment;