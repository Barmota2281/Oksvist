// src/firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyCgcw26ofW3-NX-Clx0XRdI5rs0QJ-3_HU',
  authDomain: 'oksvist-22bb4.firebaseapp.com',
  projectId: 'oksvist-22bb4',
  storageBucket: 'oksvist-22bb4.firebasestorage.app',
  messagingSenderId: '82255355371',
  appId: '1:82255355371:web:eadeb7c34c98eab0bdcdae',
  measurementId: 'G-GQNCHPSQWC'
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

let analytics = null
isSupported().then((ok) => {
  if (ok) analytics = getAnalytics(app)
}).catch(() => {})

export { app, db, auth, analytics }
