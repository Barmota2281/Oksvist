<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'
import AuthModal from './AuthModal.vue'
import CartPanel from './CartPanel.vue'

const menuOpen = ref(false)
const authModalOpen = ref(false)
const cartOpen = ref(false)

const authStore = useAuthStore()
const cartStore = useCartStore()

function openMenu() { menuOpen.value = true }
function closeMenu() { menuOpen.value = false }

function openAuth() { authModalOpen.value = true }
function closeAuth() { authModalOpen.value = false }

function toggleCart() { cartOpen.value = !cartOpen.value }
function closeCart() { cartOpen.value = false }

async function handleLogout() {
  await authStore.logout()
  cartStore.items = []
}
</script>

<template>
  <header class="header">
    <button class="header__burger" @click="openMenu" aria-label="Открыть меню">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <div class="header__logo">OKSVIST</div>

    <div class="header__icons">
      <button class="header__icon-btn" aria-label="Поиск">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </button>

      <button class="header__icon-btn" aria-label="Профиль" @click="authStore.isLoggedIn ? handleLogout() : openAuth()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span v-if="authStore.isLoggedIn" class="header__user-dot"></span>
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

  <transition name="fade">
    <div v-if="menuOpen" class="sidebar-overlay" @click="closeMenu"></div>
  </transition>

  <transition name="slide">
    <nav v-if="menuOpen" class="sidebar">
      <div class="sidebar__top">
        <span class="sidebar__label">МЕНЮ</span>
        <button class="sidebar__close" @click="closeMenu" aria-label="Закрыть меню">✕</button>
      </div>

      <div class="sidebar__divider"></div>

      <ul class="sidebar__main-links">
        <li><a href="#" @click="closeMenu">Худи</a></li>
        <li><a href="#" @click="closeMenu">Свитшоты</a></li>
        <li><a href="#" @click="closeMenu">Лонги</a></li>
        <li><a href="#" @click="closeMenu">Футболки</a></li>
        <li><a href="#" @click="closeMenu">Нижняя одежда</a></li>
        <li><a href="#" class="sidebar__all" @click="closeMenu">ПОСМОТРЕТЬ ВСЕ</a></li>
      </ul>

      <div class="sidebar__secondary">
        <a href="#" @click="closeMenu">Контакты</a>
        <a href="#" @click="closeMenu">О нас</a>
      </div>

      <div class="sidebar__divider"></div>

      <div class="sidebar__bottom">
        <a v-if="!authStore.isLoggedIn" href="#" @click.prevent="closeMenu(); openAuth()">Войти</a>
        <template v-else>
          <span class="sidebar__user-name">{{ authStore.user?.display_name || authStore.user?.email }}</span>
          <a href="#" @click.prevent="closeMenu(); handleLogout()">Выйти</a>
        </template>
        <div class="sidebar__lang">
          Русский
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
    </nav>
  </transition>

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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  background: #721E1E;
  border-bottom: 1px solid #5a1717;
  box-sizing: border-box;
}

.header__burger {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}
.header__burger span {
  display: block;
  width: 22px;
  height: 2px;
  background: #E2D797;
  border-radius: 2px;
}

.header__logo {
  font-family: 'Arial Black', Arial, sans-serif;
  font-weight: 900;
  font-size: 1.4rem;
  letter-spacing: 0.1em;
  color: #E2D797;
  text-transform: uppercase;
  cursor: pointer;
  user-select: none;
}

.header__icons {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header__icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  color: #E2D797;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.header__icon-btn:hover { opacity: 0.6; }

.header__user-dot {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #E2D797;
}

.header__cart-btn { position: relative; }
.header__cart-count {
  position: absolute;
  top: 2px;
  right: 2px;
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

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 200;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 320px;
  height: 100vh;
  background: #3d3d3d;
  z-index: 300;
  display: flex;
  flex-direction: column;
  padding: 20px 28px;
  box-sizing: border-box;
  overflow-y: auto;
}

.sidebar__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.sidebar__label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: #fff;
  text-transform: uppercase;
}
.sidebar__close {
  background: none;
  border: none;
  cursor: pointer;
  color: #fff;
  font-size: 1.2rem;
  line-height: 1;
  padding: 4px;
}
.sidebar__close:hover { opacity: 0.7; }

.sidebar__divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 12px 0;
}

.sidebar__main-links {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sidebar__main-links li a {
  display: block;
  font-size: 1.55rem;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  padding: 6px 0;
  transition: opacity 0.2s;
  line-height: 1.2;
}
.sidebar__main-links li a:hover { opacity: 0.7; }

.sidebar__all {
  font-size: 1.55rem !important;
  font-weight: 900 !important;
  text-transform: uppercase;
}

.sidebar__secondary {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 28px;
}
.sidebar__secondary a {
  font-size: 0.85rem;
  color: #fff;
  text-decoration: none;
  opacity: 0.85;
}
.sidebar__secondary a:hover { opacity: 1; }

.sidebar__bottom {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sidebar__bottom a {
  font-size: 0.85rem;
  color: #fff;
  text-decoration: none;
  opacity: 0.85;
}
.sidebar__bottom a:hover { opacity: 1; }
.sidebar__user-name {
  font-size: 0.85rem;
  color: #fff;
  opacity: 0.6;
  font-style: italic;
}

.sidebar__lang {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: #fff;
  opacity: 0.85;
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

.slide-enter-active,
.slide-leave-active { transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-enter-from,
.slide-leave-to { transform: translateX(-100%); }

.slide-right-enter-active,
.slide-right-leave-active { transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-right-enter-from,
.slide-right-leave-to { transform: translateX(100%); }
</style>
