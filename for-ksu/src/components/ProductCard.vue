<script setup>
import { computed } from 'vue'

const props = defineProps({
  product: { type: Object, required: true }
})
defineEmits(['open'])

const formattedPrice = computed(() => {
  const p = Number(props.product?.price)
  return isNaN(p) ? '—' : p.toLocaleString('ru-RU') + '.00'
})

const isSoldOut = computed(() => Number(props.product?.stock) === 0)
</script>

<template>
  <div class="card" @click="$emit('open', product)">
    <div class="card__img-wrap">
      <img
        v-if="product.images && product.images[0] && !product.images[0].includes('example.com')"
        :src="product.images[0]"
        :alt="product.name"
        class="card__img"
      />
      <div v-else class="card__img-placeholder">
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="80" rx="4" fill="#5a1717"/>
          <path d="M20 56 L32 38 L42 50 L52 36 L60 56 Z" fill="#E2D797" opacity="0.4"/>
          <circle cx="28" cy="30" r="6" fill="#E2D797" opacity="0.4"/>
        </svg>
      </div>
      <span v-if="isSoldOut" class="card__badge">РАСПРОДАНО</span>
    </div>
    <div class="card__info">
      <p class="card__name">{{ product.name }}</p>
      <p class="card__price">₸{{ formattedPrice }}</p>
    </div>
  </div>
</template>

<style scoped>
.card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card__img-wrap {
  position: relative;
  background: #5c1c1c;
  aspect-ratio: 3/4;
  overflow: hidden;
  border-radius: 2px;
}
.card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.card:hover .card__img {
  transform: scale(1.04);
}
.card__img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.4s ease;
}
.card:hover .card__img-placeholder {
  transform: scale(1.04);
}
.card__img-placeholder svg {
  width: 70%;
  height: 70%;
}

.card__badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #3d3d3d;
  color: #E2D797;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
}

.card__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.card__name {
  font-size: 0.9rem;
  color: #E2D797;
  font-weight: 500;
  margin: 0;
  line-height: 1.3;
}
.card__price {
  font-size: 0.95rem;
  color: #E2D797;
  font-weight: 700;
  margin: 0;
}
</style>

