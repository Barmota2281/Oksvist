<script setup>
import { watch } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import bwSlider from './components/PromoSlider.vue'
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
  <bwSlider />
  <main class="main-content">
    <RouterView />
  </main>
</template>

<style scoped>
.main-content {
  padding-top: 24px;
  color: #E2D797;
  font-family: Arial, sans-serif;
}
</style>
