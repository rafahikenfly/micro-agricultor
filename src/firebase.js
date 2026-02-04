import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";
import { firebaseConfig } from "./firebaseConfig";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export const storage = firebase.storage();
export const timestamp = firebase.firestore.FieldValue.serverTimestamp;
export const nowTimestamp = firebase.firestore.Timestamp.now;
export const increment = firebase.firestore.FieldValue.increment;