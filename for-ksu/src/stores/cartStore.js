import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuthStore } from './authStore'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  const totalCount = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
  const totalPrice = computed(() => items.value.reduce((s, i) => s + i.price * i.quantity, 0))

  async function loadCart() {
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) return
    const snap = await getDoc(doc(db, 'carts', authStore.user.uid))
    if (snap.exists()) {
      items.value = snap.data().items || []
    } else {
      items.value = []
    }
  }

  async function saveCart() {
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) return
    await setDoc(doc(db, 'carts', authStore.user.uid), {
      cart_id: authStore.user.uid,
      user_id: authStore.user.uid,
      items: items.value,
      updated_at: serverTimestamp()
    })
  }

  async function addItem(product, size, color) {
    const authStore = useAuthStore()
    if (!authStore.isLoggedIn) return false

    const idx = items.value.findIndex(
      i => i.product_id === product.id && i.size === size && i.color === color
    )
    if (idx >= 0) {
      items.value[idx].quantity++
    } else {
      items.value.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || null,
        size,
        color,
        quantity: 1
      })
    }
    await saveCart()
    return true
  }

  async function removeItem(product_id, size, color) {
    items.value = items.value.filter(
      i => !(i.product_id === product_id && i.size === size && i.color === color)
    )
    await saveCart()
  }

  async function updateQuantity(product_id, size, color, quantity) {
    const idx = items.value.findIndex(
      i => i.product_id === product_id && i.size === size && i.color === color
    )
    if (idx >= 0) {
      if (quantity <= 0) {
        items.value.splice(idx, 1)
      } else {
        items.value[idx].quantity = quantity
      }
      await saveCart()
    }
  }

  async function clearCart() {
    items.value = []
    await saveCart()
  }

  return { items, totalCount, totalPrice, loadCart, addItem, removeItem, updateQuantity, clearCart }
})

