<script setup>
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'

defineEmits(['close'])

const cart = useCartStore()
const auth = useAuthStore()
</script>

<template>
  <div class="cart-overlay" @click.self="$emit('close')"></div>

  <div class="cart-panel">
    <div class="cart-panel__top">
      <span class="cart-panel__title">КОРЗИНА</span>
      <button class="cart-panel__close" @click="$emit('close')">✕</button>
    </div>

    <div class="cart-panel__divider"></div>

    <div v-if="!auth.isLoggedIn" class="cart-panel__empty">
      <p>Войдите, чтобы видеть корзину</p>
    </div>

    <div v-else-if="cart.items.length === 0" class="cart-panel__empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
      <p>Корзина пуста</p>
    </div>

    <div v-else class="cart-panel__items">
      <div v-for="item in cart.items" :key="item.product_id + item.size + item.color" class="cart-item">
        <div class="cart-item__img">
          <img v-if="item.image && !item.image.includes('example.com')" :src="item.image" :alt="item.name" />
          <div v-else class="cart-item__img-placeholder">
            <svg viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" fill="#5a1717"/>
              <circle cx="14" cy="14" r="5" fill="#E2D797" opacity="0.3"/>
              <path d="M8 32 L15 22 L21 28 L27 18 L32 32Z" fill="#E2D797" opacity="0.3"/>
            </svg>
          </div>
        </div>

        <div class="cart-item__info">
          <p class="cart-item__name">{{ item.name }}</p>
          <p class="cart-item__meta">{{ item.size }} · {{ item.color }}</p>
          <p class="cart-item__price">₸{{ (item.price * item.quantity).toLocaleString('ru-RU') }}.00</p>

          <div class="cart-item__qty">
            <button @click="cart.updateQuantity(item.product_id, item.size, item.color, item.quantity - 1)">−</button>
            <span>{{ item.quantity }}</span>
            <button @click="cart.updateQuantity(item.product_id, item.size, item.color, item.quantity + 1)">+</button>
          </div>
        </div>

        <button class="cart-item__remove" @click="cart.removeItem(item.product_id, item.size, item.color)">✕</button>
      </div>
    </div>

    <div v-if="auth.isLoggedIn && cart.items.length > 0" class="cart-panel__footer">
      <div class="cart-panel__divider"></div>
      <div class="cart-panel__total">
        <span>Итого</span>
        <span>₸{{ cart.totalPrice.toLocaleString('ru-RU') }}.00</span>
      </div>
      <button class="cart-panel__checkout">ОФОРМИТЬ ЗАКАЗ</button>
      <button class="cart-panel__clear" @click="cart.clearCart()">Очистить корзину</button>
    </div>
  </div>
</template>

<style scoped>
.cart-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 400;
}

.cart-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 380px;
  height: 100vh;
  background: #721E1E;
  border-left: 1px solid #5a1717;
  z-index: 500;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

.cart-panel__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  flex-shrink: 0;
}
.cart-panel__title {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: #E2D797;
}
.cart-panel__close {
  background: none;
  border: none;
  color: #E2D797;
  font-size: 1.1rem;
  cursor: pointer;
  opacity: 0.7;
  padding: 4px;
}
.cart-panel__close:hover { opacity: 1; }

.cart-panel__divider {
  height: 1px;
  background: #5a1717;
  flex-shrink: 0;
}

.cart-panel__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #E2D797;
  opacity: 0.45;
  font-size: 0.9rem;
}

.cart-panel__items {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}
.cart-panel__items::-webkit-scrollbar { width: 4px; }
.cart-panel__items::-webkit-scrollbar-thumb { background: #5a1717; border-radius: 2px; }

.cart-item {
  display: flex;
  gap: 12px;
  padding: 14px 24px;
  border-bottom: 1px solid rgba(90,23,23,0.6);
  position: relative;
}

.cart-item__img {
  width: 72px;
  height: 90px;
  flex-shrink: 0;
  border-radius: 2px;
  overflow: hidden;
  background: #5c1c1c;
}
.cart-item__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cart-item__img-placeholder {
  width: 100%;
  height: 100%;
}
.cart-item__img-placeholder svg { width: 100%; height: 100%; }

.cart-item__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.cart-item__name {
  font-size: 0.82rem;
  font-weight: 600;
  color: #E2D797;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cart-item__meta {
  font-size: 0.72rem;
  color: #E2D797;
  opacity: 0.5;
  margin: 0;
}
.cart-item__price {
  font-size: 0.85rem;
  font-weight: 700;
  color: #E2D797;
  margin: 0;
}
.cart-item__qty {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}
.cart-item__qty button {
  width: 26px;
  height: 26px;
  background: rgba(226,215,151,0.08);
  border: 1px solid rgba(226,215,151,0.25);
  border-radius: 50%;
  color: #E2D797;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  line-height: 1;
}
.cart-item__qty button:hover { background: rgba(226,215,151,0.18); }
.cart-item__qty span {
  font-size: 0.85rem;
  color: #E2D797;
  min-width: 16px;
  text-align: center;
}

.cart-item__remove {
  position: absolute;
  top: 14px;
  right: 14px;
  background: none;
  border: none;
  color: #E2D797;
  opacity: 0.35;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 2px;
  transition: opacity 0.2s;
}
.cart-item__remove:hover { opacity: 0.9; }

.cart-panel__footer {
  flex-shrink: 0;
  padding: 0 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cart-panel__total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0 4px;
  color: #E2D797;
  font-size: 0.9rem;
  font-weight: 700;
}
.cart-panel__checkout {
  width: 100%;
  height: 50px;
  background: #E2D797;
  color: #721E1E;
  border: none;
  border-radius: 40px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: opacity 0.2s;
}
.cart-panel__checkout:hover { opacity: 0.88; }
.cart-panel__clear {
  background: none;
  border: none;
  color: #E2D797;
  font-size: 0.72rem;
  opacity: 0.45;
  cursor: pointer;
  text-align: center;
  transition: opacity 0.2s;
  text-decoration: underline;
}
.cart-panel__clear:hover { opacity: 0.8; }

@media (max-width: 420px) {
  .cart-panel { width: 100%; }
}
</style>

