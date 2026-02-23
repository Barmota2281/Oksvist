// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgcw26ofW3-NX-Clx0XRdI5rs0QJ-3_HU",
  authDomain: "oksvist-22bb4.firebaseapp.com",
  projectId: "oksvist-22bb4",
  storageBucket: "oksvist-22bb4.firebasestorage.app",
  messagingSenderId: "82255355371",
  appId: "1:82255355371:web:eadeb7c34c98eab0bdcdae",
  measurementId: "G-GQNCHPSQWC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Firebase Auth
const auth = getAuth(app);

export { app, analytics, db, auth };
