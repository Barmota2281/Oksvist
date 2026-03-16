<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'
import AuthModal from './AuthModal.vue'
import CartPanel from './CartPanel.vue'

const authModalOpen = ref(false)
const cartOpen = ref(false)

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

function openAuth() { authModalOpen.value = true }
function closeAuth() { authModalOpen.value = false }

function toggleCart() { cartOpen.value = !cartOpen.value }
function closeCart() { cartOpen.value = false }

async function handleLogout() {
  await authStore.logout()
  cartStore.items = []
  router.push('/')
}
</script>

<template>
  <header class="header">
    <RouterLink to="/" class="header__logo">Oxystance</RouterLink>

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

      <RouterLink v-if="authStore.user?.role === 'admin'" to="/admin" class="header__icon-btn" aria-label="Админ панель">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <line x1="9" y1="3" x2="9" y2="21"/>
        </svg>
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
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  height: 60px;
  box-sizing: border-box;
  background: #6E1920;
}

.header__logo {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.5rem;
  font-weight: 700;
  color: #E2D797;
  text-decoration: none;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.header__icons {
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
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
  color: #6E1920;
  font-size: 0.6rem;
  font-weight: 700;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  line-height: 1;
}

@media (max-width: 768px) {
  .header__icons { right: 12px; gap: 6px; }
  .header__icon-btn { padding: 6px; border-radius: 8px; }
  .header__logo { left: 16px; font-size: 1.2rem; }
}
</style>
