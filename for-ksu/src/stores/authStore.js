import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)

  const isLoggedIn = computed(() => !!user.value)

  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
      user.value = snap.exists()
        ? { uid: firebaseUser.uid, email: firebaseUser.email, ...snap.data() }
        : { uid: firebaseUser.uid, email: firebaseUser.email, display_name: firebaseUser.displayName }
    } else {
      user.value = null
    }
    loading.value = false
  })

  async function register(email, password, displayName) {
    error.value = null
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName })
      await setDoc(doc(db, 'users', cred.user.uid), {
        user_id: cred.user.uid,
        email,
        display_name: displayName,
        phone: '',
        role: 'customer',
        created_at: serverTimestamp()
      })
    } catch (e) {
      error.value = formatError(e.code)
      throw e
    }
  }

  async function login(email, password) {
    error.value = null
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (e) {
      error.value = formatError(e.code)
      throw e
    }
  }

  async function logout() {
    await signOut(auth)
    user.value = null
  }

  async function updateUserData({ displayName, phone }) {
    if (!auth.currentUser) return

    if (displayName) {
      await updateProfile(auth.currentUser, { displayName })
    }

    const userRef = doc(db, 'users', auth.currentUser.uid)
    await setDoc(userRef, {
      display_name: displayName,
      phone: phone
    }, { merge: true })

    if (user.value) {
      user.value = { ...user.value, display_name: displayName, phone }
    }
  }

  function clearError() {
    error.value = null
  }

  function formatError(code) {
    const map = {
      'auth/email-already-in-use': 'Этот email уже используется',
      'auth/invalid-email': 'Некорректный email',
      'auth/weak-password': 'Пароль должен содержать минимум 6 символов',
      'auth/user-not-found': 'Пользователь не найден',
      'auth/wrong-password': 'Неверный пароль',
      'auth/invalid-credential': 'Неверный email или пароль',
      'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже'
    }
    return map[code] || 'Произошла ошибка. Попробуйте снова'
  }

  return { user, loading, error, isLoggedIn, register, login, logout, updateUserData, clearError }
})
