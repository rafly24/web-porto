const firebaseConfig = {
  apiKey: "AIzaSyDIVIaz2lrgEPbzG_CejpNdCgXHQ66mzig",
  authDomain: "lapor-in-22a8a.firebaseapp.com",
  projectId: "lapor-in-22a8a",
  storageBucket: "lapor-in-22a8a.firebasestorage.app",
  messagingSenderId: "113874778820",
  appId: "1:113874778820:web:77c8c8a7be34f396fc6791",
  measurementId: "G-37CVH7P1HV",
};

try {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}
const db = firebase.firestore();
const auth = firebase.auth();
window.db = db;
window.auth = auth;
