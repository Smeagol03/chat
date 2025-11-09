import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCCVafGr8HTqH6zDY1eNeRjOmBT2rg-f-0",
  authDomain: "absensi-fa91a.firebaseapp.com",
  databaseURL:
    "https://absensi-fa91a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "absensi-fa91a",
  storageBucket: "absensi-fa91a.firebasestorage.app",
  messagingSenderId: "56778176193",
  appId: "1:56778176193:web:7e9c7599a11f4723470640",
  measurementId: "G-7213NTVF6F",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);
const storage = getStorage(app);

export { app, auth, db, rtdb, storage };
