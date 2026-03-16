<!-- src/components/ProductCard.vue -->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: { type: Object, required: true }
})

const emit = defineEmits(['open'])

const safeName = computed(() => props.product?.name || 'Товар')
const safeImage = computed(() => {
  const img = props.product?.images?.[0]
  return typeof img === 'string' && img.trim() ? img : ''
})
const formattedPrice = computed(() => {
  const p = Number(props.product?.price)
  return Number.isFinite(p) ? p.toLocaleString('ru-RU') + ' ₸' : 'Цена не указана'
})
const isSoldOut = computed(() => Number(props.product?.stock || 0) <= 0)

function openCard() {
  if (props.product) emit('open', props.product)
}
</script>

<template>
  <article v-if="product" class="card" @click="openCard">
    <div class="card__img-wrap">
      <img v-if="safeImage" :src="safeImage" :alt="safeName" class="card__img" />
      <div v-else class="card__img-placeholder"></div>
      <span v-if="isSoldOut" class="card__badge">РАСПРОДАНО</span>
    </div>
    <div class="card__info">
      <p class="card__name">{{ safeName }}</p>
      <p class="card__price">{{ formattedPrice }}</p>
    </div>
  </article>
</template>

<style scoped>
.card { cursor: pointer; display: flex; flex-direction: column; gap: 10px; }
.card__img-wrap { position: relative; background: #5c1c1c; aspect-ratio: 3/4; overflow: hidden; border-radius: 2px; }
.card__img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s ease; }
.card:hover .card__img { transform: scale(1.04); }
.card__img-placeholder { width: 100%; height: 100%; background: rgba(226, 215, 151, .12); }
.card__badge { position: absolute; top: 12px; right: 12px; background: #3d3d3d; color: #E2D797; font-size: .6rem; font-weight: 700; letter-spacing: .1em; padding: 4px 10px; border-radius: 20px; }
.card__info { display: flex; flex-direction: column; gap: 4px; }
.card__name { font-size: .9rem; color: #E2D797; font-weight: 500; margin: 0; line-height: 1.3; }
.card__price { font-size: .95rem; color: #E2D797; font-weight: 700; margin: 0; }
</style>
