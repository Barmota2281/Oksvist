<script setup>
import { watch } from 'vue'
import AppHeader from './components/AppHeader.vue'
import ProductCatalog from './components/ProductCatalog.vue'
import { useAuthStore } from './stores/authStore'
import { useCartStore } from './stores/cartStore'

const authStore = useAuthStore()
const cartStore = useCartStore()

watch(() => authStore.isLoggedIn, (loggedIn) => {
  if (loggedIn) cartStore.loadCart()
  else cartStore.items = []
}, { immediate: true })
</script>

<template>
  <AppHeader />
  <main class="main-content">
    <ProductCatalog />
  </main>
</template>

<style scoped>
.main-content {
  padding-top: 60px;
  color: #E2D797;
  font-family: Arial, sans-serif;
}
</style>
