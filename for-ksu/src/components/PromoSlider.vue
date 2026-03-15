<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs, limit, query } from 'firebase/firestore'
import { db } from '../firebase'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import ProductDetail from './ProductDetail.vue'
import heroImage from '../assets/header-bg.jpg'

const sliderProducts = ref([])
const selectedProduct = ref(null)
const swiperModules = [Autoplay, Pagination]

function formatPrice(value) {
  const p = Number(value)
  return Number.isFinite(p) ? p.toLocaleString('ru-RU') : '—'
}

function getImage(product) {
  const img = product?.images?.[0]
  if (!img || typeof img !== 'string') return ''
  if (img.includes('example.com')) return ''
  return img
}

function openProduct(product) { selectedProduct.value = product }
function closeProduct() { selectedProduct.value = null }

onMounted(async () => {
  const snap = await getDocs(query(collection(db, 'products'), limit(5)))
  sliderProducts.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
})
</script>

<template>
  <section class="promo-slider">
    <Swiper
      v-if="sliderProducts.length"
      class="slider-swiper"
      :modules="swiperModules"
      :slides-per-view="1"
      :loop="sliderProducts.length > 1"
      :autoplay="{ delay: 3500, disableOnInteraction: false }"
      :pagination="{ clickable: true }"
    >
      <SwiperSlide v-for="product in sliderProducts" :key="product.id">
        <div class="slide" @click="openProduct(product)">
          <img v-if="getImage(product)" :src="getImage(product)" :alt="product.name" class="slide-img" />
          <div v-else class="slide-placeholder"></div>
          <div class="slide-info">
            <span class="slide-name">{{ product.name }}</span>
            <span class="slide-price">₸{{ formatPrice(product.price) }}</span>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <img v-else :src="heroImage" alt="Banner" class="slider-banner" />

    <Teleport to="body">
      <transition name="detail-fade">
        <ProductDetail v-if="selectedProduct" :product="selectedProduct" @close="closeProduct" />
      </transition>
    </Teleport>
  </section>
</template>

<style scoped>
.promo-slider {
  position: relative;
  width: 100%;
  height: 600px;
  overflow: hidden;
}

.slider-swiper,
.slider-banner {
  width: 100%;
  height: 100%;
  display: block;
}

.slide {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
}

.slide-img, .slider-banner {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.slide-placeholder {
  width: 100%;
  height: 100%;
  background: #5a1717;
}

.slide-info {
  position: absolute;
  left: 24px;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(226, 215, 151, 0.3);
  border-radius: 12px;
  padding: 10px 14px;
  color: #E2D797;
}

.slide-name {
  font-size: 1.1rem;
  font-weight: 700;
}

.slide-price {
  font-size: 0.95rem;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .promo-slider { height: 420px; }
  .slide-info { left: 18px; bottom: 16px; padding: 8px 12px; }
  .slide-name { font-size: 1rem; }
  .slide-price { font-size: 0.9rem; }
}

@media (max-width: 768px) {
  .promo-slider { height: 320px; }
  .slide-info { left: 14px; bottom: 12px; }
}

@media (max-width: 480px) {
  .promo-slider { height: 240px; }
  .slide-info { left: 10px; bottom: 10px; padding: 6px 10px; }
  .slide-name { font-size: 0.9rem; }
  .slide-price { font-size: 0.8rem; }
}
</style>

