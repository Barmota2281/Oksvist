// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import ProductCatalog from '../components/ProductCatalog.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import AdminPage from '../pages/AdminPage.vue'
import { auth, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

const routes = [
  { path: '/', name: 'home', component: ProductCatalog },
  { path: '/profile', name: 'profile', component: ProfilePage, meta: { requiresAuth: true, hideSlider: true } },
  { path: '/admin', name: 'admin', component: AdminPage, meta: { requiresAuth: true, requiresAdmin: true, hideSlider: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

function waitForAuthInit() {
  return new Promise((resolve) => {
    const un = auth.onAuthStateChanged(() => {
      un()
      resolve()
    })
  })
}

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    await waitForAuthInit()
    if (!auth.currentUser) return '/'

    if (to.meta.requiresAdmin) {
      try {
        const snap = await getDoc(doc(db, 'users', auth.currentUser.uid))
        if (!snap.exists() || snap.data().role !== 'admin') {
          return '/'
        }
      } catch (e) {
        console.error('Admin check failed', e)
        return '/'
      }
    }
  }
  return true
})

export default router
