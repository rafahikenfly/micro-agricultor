import { createRequire } from "module";
const require = createRequire(import.meta.url);

const firebase = require("firebase/app");
require("firebase/firestore");
require("firebase/auth");
require("firebase/storage");
import { firebaseConfig } from "./firebaseConfig.js";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
export const timestamp = firebase.firestore.FieldValue.serverTimestamp;
export const nowTimestamp = firebase.firestore.Timestamp.now;
export const increment = firebase.firestore.FieldValue.increment;