import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyCixhsCgFSTX8jzDkJryKRkaVfJUW1HT14",
  authDomain: "movie-app-c3270.firebaseapp.com",
  projectId: "movie-app-c3270",
  storageBucket: "movie-app-c3270.firebasestorage.app",
  messagingSenderId: "761229698375",
  appId: "1:761229698375:web:2494b0938ef489e4045862",
  measurementId: "G-Q7W85P2DKB",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app);
export const db = getFirestore(app);
