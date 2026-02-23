<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  product: { type: Object, required: true }
})
defineEmits(['close'])

const selectedSize = ref(null)
const currentImg = ref(0)

const images = computed(() => {
  if (props.product.images && props.product.images.length > 0 && !props.product.images[0].includes('example.com')) {
    return props.product.images
  }
  return null
})

const isSoldOut = computed(() => props.product.stock === 0)

function selectSize(size) {
  if (!isSoldOut.value) selectedSize.value = size
}

function stars(rating) {
  return Math.round(rating || 0)
}
</script>

<template>
  <div class="detail-overlay" @click.self="$emit('close')">
    <div class="detail">
      <button class="detail__close" @click="$emit('close')">✕</button>

      <div class="detail__left">
        <div class="detail__main-img">
          <div v-if="images" class="detail__img-wrap">
            <img :src="images[currentImg]" :alt="product.name" />
          </div>
          <div v-else class="detail__img-placeholder">
            <svg viewBox="0 0 200 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="240" rx="4" fill="#5c1c1c"/>
              <path d="M50 190 L80 140 L105 165 L130 120 L150 190 Z" fill="#E2D797" opacity="0.35"/>
              <circle cx="70" cy="90" r="22" fill="#E2D797" opacity="0.35"/>
            </svg>
          </div>
        </div>

        <div v-if="images && images.length > 1" class="detail__thumbs">
          <div
            v-for="(img, i) in images"
            :key="i"
            class="detail__thumb"
            :class="{ active: currentImg === i }"
            @click="currentImg = i"
          >
            <img :src="img" :alt="product.name" />
          </div>
        </div>

        <div v-else class="detail__dots">
          <span class="detail__dot active"></span>
          <span class="detail__dot"></span>
          <span class="detail__dot"></span>
        </div>
      </div>

      <div class="detail__right">
        <div class="detail__title-row">
          <h1 class="detail__title">{{ product.name }}</h1>
          <span v-if="isSoldOut" class="detail__badge">РАСПРОДАНО</span>
        </div>

        <p class="detail__price">₸{{ product.price.toLocaleString('ru-RU') }}.00</p>

        <div class="detail__rating">
          <span v-for="i in 5" :key="i" class="detail__star" :class="{ filled: i <= stars(product.rating) }">★</span>
          <span class="detail__rating-val">{{ product.rating }}</span>
        </div>

        <div class="detail__size-guide">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 7h18M3 12h18M3 17h18"/>
          </svg>
          Размерная сетка
        </div>

        <div class="detail__sizes-label">Выберите Size</div>
        <div class="detail__sizes">
          <button
            v-for="size in product.sizes"
            :key="size"
            class="detail__size-btn"
            :class="{
              active: selectedSize === size,
              disabled: isSoldOut
            }"
            @click="selectSize(size)"
          >
            {{ size }}
          </button>
        </div>

        <button class="detail__cart-btn" :class="{ soldout: isSoldOut }" :disabled="isSoldOut">
          {{ isSoldOut ? 'РАСПРОДАНО' : 'ДОБАВИТЬ В КОРЗИНУ' }}
        </button>

        <div class="detail__colors" v-if="product.colors && product.colors.length">
          <span class="detail__colors-label">Цвета:</span>
          <span v-for="color in product.colors" :key="color" class="detail__color-tag">{{ color }}</span>
        </div>

        <p class="detail__desc">{{ product.description }}</p>

        <div class="detail__meta">
          <span class="detail__category">Категория: {{ product.category }}</span>
          <span v-if="product.stock > 0" class="detail__stock">В наличии: {{ product.stock }} шт.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.detail {
  background: #721E1E;
  border: 1px solid #5a1717;
  border-radius: 4px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  position: relative;
  box-sizing: border-box;
}

.detail__close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #E2D797;
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 10;
  padding: 4px 8px;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.detail__close:hover { opacity: 1; }

.detail__left {
  border-right: 1px solid #5a1717;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 28px 24px;
}

.detail__main-img {
  aspect-ratio: 3/4;
  overflow: hidden;
  border-radius: 2px;
  background: #5c1c1c;
}
.detail__main-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.detail__img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.detail__img-placeholder svg {
  width: 80%;
  height: 80%;
}

.detail__thumbs {
  display: flex;
  gap: 8px;
}
.detail__thumb {
  width: 60px;
  height: 72px;
  border: 2px solid transparent;
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
  background: #5c1c1c;
}
.detail__thumb.active { border-color: #E2D797; }
.detail__thumb img { width: 100%; height: 100%; object-fit: cover; }

.detail__dots {
  display: flex;
  gap: 6px;
  justify-content: center;
  padding: 4px 0;
}
.detail__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #E2D797;
  opacity: 0.3;
}
.detail__dot.active { opacity: 1; }

.detail__right {
  padding: 36px 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail__title-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}
.detail__title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #E2D797;
  margin: 0;
  line-height: 1.2;
}
.detail__badge {
  background: #3d3d3d;
  color: #E2D797;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 4px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  white-space: nowrap;
  align-self: center;
}

.detail__price {
  font-size: 1.4rem;
  font-weight: 700;
  color: #E2D797;
  margin: 0;
}

.detail__rating {
  display: flex;
  align-items: center;
  gap: 4px;
}
.detail__star {
  font-size: 1rem;
  color: #E2D797;
  opacity: 0.25;
}
.detail__star.filled { opacity: 1; }
.detail__rating-val {
  font-size: 0.8rem;
  color: #E2D797;
  opacity: 0.7;
  margin-left: 4px;
}

.detail__size-guide {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #E2D797;
  opacity: 0.7;
  cursor: pointer;
  border-top: 1px solid #5a1717;
  padding-top: 16px;
}

.detail__sizes-label {
  font-size: 0.8rem;
  color: #E2D797;
  opacity: 0.7;
}
.detail__sizes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.detail__size-btn {
  min-width: 44px;
  height: 44px;
  padding: 0 10px;
  border: 1px solid rgba(226,215,151,0.4);
  border-radius: 50%;
  background: none;
  color: #E2D797;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0.6;
}
.detail__size-btn:hover { opacity: 1; border-color: #E2D797; }
.detail__size-btn.active { border-color: #E2D797; opacity: 1; background: rgba(226,215,151,0.1); }
.detail__size-btn.disabled { opacity: 0.25; cursor: default; text-decoration: line-through; }

.detail__cart-btn {
  width: 100%;
  height: 52px;
  border: 1px solid rgba(226,215,151,0.5);
  border-radius: 40px;
  background: none;
  color: #E2D797;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
}
.detail__cart-btn:hover:not(.soldout) {
  background: rgba(226,215,151,0.1);
  border-color: #E2D797;
}
.detail__cart-btn.soldout {
  opacity: 0.35;
  cursor: default;
}

.detail__colors {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
.detail__colors-label {
  font-size: 0.78rem;
  color: #E2D797;
  opacity: 0.6;
}
.detail__color-tag {
  font-size: 0.75rem;
  color: #E2D797;
  border: 1px solid rgba(226,215,151,0.3);
  border-radius: 12px;
  padding: 2px 10px;
  opacity: 0.75;
}

.detail__desc {
  font-size: 0.85rem;
  color: #E2D797;
  opacity: 0.8;
  line-height: 1.7;
  margin: 0;
  border-top: 1px solid #5a1717;
  padding-top: 16px;
}

.detail__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.detail__category,
.detail__stock {
  font-size: 0.75rem;
  color: #E2D797;
  opacity: 0.5;
}

@media (max-width: 680px) {
  .detail { grid-template-columns: 1fr; }
  .detail__left { border-right: none; border-bottom: 1px solid #5a1717; }
}
</style>

