<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { collection, getDocs, limit, query } from 'firebase/firestore'
import { db } from '../firebase'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'
import AuthModal from './AuthModal.vue'
import CartPanel from './CartPanel.vue'
import heroImage from '../assets/header-bg.jpg'

const authModalOpen = ref(false)
const cartOpen = ref(false)

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

const sliderProducts = ref([])
const swiperModules = [Autoplay, Pagination]

function openAuth() { authModalOpen.value = true }
function closeAuth() { authModalOpen.value = false }

function toggleCart() { cartOpen.value = !cartOpen.value }
function closeCart() { cartOpen.value = false }

async function handleLogout() {
  await authStore.logout()
  cartStore.items = []
  router.push('/')
}

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

onMounted(async () => {
  const snap = await getDocs(query(collection(db, 'products'), limit(5)))
  sliderProducts.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
})
</script>

<template>
  <header class="header">
    <Swiper
      v-if="sliderProducts.length"
      class="header__swiper"
      :modules="swiperModules"
      :slides-per-view="1"
      :loop="sliderProducts.length > 1"
      :autoplay="{ delay: 3500, disableOnInteraction: false }"
      :pagination="{ clickable: true }"
    >
      <SwiperSlide v-for="product in sliderProducts" :key="product.id">
        <div class="header__slide">
          <img v-if="getImage(product)" :src="getImage(product)" :alt="product.name" class="header__slide-img" />
          <div v-else class="header__slide-placeholder"></div>
          <div class="header__slide-info">
            <span class="header__slide-name">{{ product.name }}</span>
            <span class="header__slide-price">₸{{ formatPrice(product.price) }}</span>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>

    <img v-else :src="heroImage" alt="Oxystance banner" class="header__banner" />

    <div class="header__icons">
      <button v-if="!authStore.isLoggedIn" class="header__icon-btn" aria-label="Вход" @click="openAuth">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </button>

      <RouterLink v-else to="/profile" class="header__icon-btn" aria-label="Личный кабинет">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span class="header__user-dot"></span>
      </RouterLink>

      <button v-if="authStore.isLoggedIn" class="header__icon-btn" aria-label="Выйти" @click="handleLogout">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>

      <button class="header__icon-btn header__cart-btn" aria-label="Корзина" @click="toggleCart">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <span v-if="cartStore.totalCount > 0" class="header__cart-count">{{ cartStore.totalCount }}</span>
      </button>
    </div>
  </header>

  <Teleport to="body">
    <transition name="fade">
      <AuthModal v-if="authModalOpen" @close="closeAuth" />
    </transition>
  </Teleport>

  <Teleport to="body">
    <transition name="slide-right">
      <CartPanel v-if="cartOpen" @close="closeCart" />
    </transition>
  </Teleport>
</template>

<style scoped>
.header {
  position: relative;
  width: 100%;
  z-index: 100;
  height: 600px;
  box-sizing: border-box;
  overflow: hidden;
}

.header__swiper,
.header__banner {
  width: 100%;
  height: 100%;
  display: block;
}

.header__slide {
  width: 100%;
  height: 100%;
  position: relative;
}

.header__slide-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.header__slide-placeholder {
  width: 100%;
  height: 100%;
  background: #5a1717;
}

.header__slide-info {
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

.header__slide-name {
  font-size: 1.1rem;
  font-weight: 700;
}

.header__slide-price {
  font-size: 0.95rem;
  font-weight: 600;
}

.header__icons {
  position: absolute;
  top: 14px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header__icon-btn {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(226, 215, 151, 0.4);
  border-radius: 10px;
  cursor: pointer;
  padding: 8px;
  color: #E2D797;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.header__user-dot {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #E2D797;
}

.header__cart-btn { position: relative; }
.header__cart-count {
  position: absolute;
  top: 1px;
  right: 1px;
  min-width: 16px;
  height: 16px;
  background: #E2D797;
  color: #721E1E;
  font-size: 0.6rem;
  font-weight: 700;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  line-height: 1;
}
</style>
