<script setup>
import { watch, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import bwSlider from './components/PromoSlider.vue'
import { useAuthStore } from './stores/authStore'
import { useCartStore } from './stores/cartStore'

const authStore = useAuthStore()
const cartStore = useCartStore()
const route = useRoute()

const showSlider = computed(() => !route.meta?.hideSlider)

watch(() => authStore.isLoggedIn, (loggedIn) => {
  if (loggedIn) cartStore.loadCart()
  else cartStore.items = []
}, { immediate: true })
</script>

<template>
  <AppHeader />
  <div class="content-wrapper">
    <bwSlider v-if="showSlider" />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.content-wrapper {
  padding-top: 60px;
}
.main-content {
  padding-top: 24px;
  color: #E2D797;
  font-family: Arial, sans-serif;
}
</style>
