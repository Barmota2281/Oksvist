<script setup>
import AppHeader from './components/AppHeader.vue'
import ProductCatalog from './components/ProductCatalog.vue'
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
