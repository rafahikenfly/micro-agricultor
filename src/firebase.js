import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDrDibVsbU0f24v_EmegkKtCFLid50ohsw",
    authDomain: "micro-agricultor.firebaseapp.com",
    projectId: "micro-agricultor",
    storageBucket: "micro-agricultor.firebasestorage.app",
    messagingSenderId: "960640056706",
    appId: "1:960640056706:web:b4838f85d97db6c1aee39b",
    measurementId: "G-2TCGDB4TTB"
  };

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export const storage = firebase.storage();
export const timestamp = firebase.firestore.FieldValue.serverTimestamp;
