<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'

const emit = defineEmits(['close'])
const authStore = useAuthStore()
const cartStore = useCartStore()

const mode = ref('login')
const email = ref('')
const password = ref('')
const displayName = ref('')
const submitting = ref(false)

watch(() => authStore.error, (val) => { if (val) submitting.value = false })

function switchMode(m) {
  mode.value = m
  authStore.clearError()
}

async function submit() {
  submitting.value = true
  authStore.clearError()
  try {
    if (mode.value === 'login') {
      await authStore.login(email.value, password.value)
    } else {
      await authStore.register(email.value, password.value, displayName.value)
    }
    await cartStore.loadCart()
    emit('close')
  } catch {
    submitting.value = false
  }
}

function close() {
  authStore.clearError()
  emit('close')
}
</script>

<template>
  <div class="auth-overlay" @click.self="close">
    <div class="auth-modal">
      <button class="auth-modal__close" @click="close">✕</button>

      <div class="auth-modal__tabs">
        <button :class="{ active: mode === 'login' }" @click="switchMode('login')">Вход</button>
        <button :class="{ active: mode === 'register' }" @click="switchMode('register')">Регистрация</button>
      </div>

      <form class="auth-modal__form" @submit.prevent="submit">
        <div v-if="mode === 'register'" class="auth-modal__field">
          <label>Имя</label>
          <input v-model="displayName" type="text" placeholder="Ваше имя" required autocomplete="name" />
        </div>

        <div class="auth-modal__field">
          <label>Email</label>
          <input v-model="email" type="email" placeholder="example@mail.com" required autocomplete="email" />
        </div>

        <div class="auth-modal__field">
          <label>Пароль</label>
          <input v-model="password" type="password" placeholder="••••••" required autocomplete="current-password" />
        </div>

        <p v-if="authStore.error" class="auth-modal__error">{{ authStore.error }}</p>

        <button class="auth-modal__submit" type="submit" :disabled="submitting">
          <span v-if="submitting">...</span>
          <span v-else-if="mode === 'login'">ВОЙТИ</span>
          <span v-else>ЗАРЕГИСТРИРОВАТЬСЯ</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.auth-modal {
  background: #721E1E;
  border: 1px solid #5a1717;
  border-radius: 6px;
  width: 100%;
  max-width: 420px;
  padding: 36px 32px 32px;
  box-sizing: border-box;
  position: relative;
}

.auth-modal__close {
  position: absolute;
  top: 14px;
  right: 16px;
  background: none;
  border: none;
  color: #E2D797;
  font-size: 1.1rem;
  cursor: pointer;
  opacity: 0.7;
}
.auth-modal__close:hover { opacity: 1; }

.auth-modal__tabs {
  display: flex;
  gap: 0;
  margin-bottom: 28px;
  border-bottom: 1px solid #5a1717;
}
.auth-modal__tabs button {
  flex: 1;
  background: none;
  border: none;
  color: #E2D797;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 10px 0;
  cursor: pointer;
  opacity: 0.45;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.2s;
}
.auth-modal__tabs button.active {
  opacity: 1;
  border-bottom-color: #E2D797;
}

.auth-modal__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-modal__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.auth-modal__field label {
  font-size: 0.75rem;
  color: #E2D797;
  opacity: 0.7;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.auth-modal__field input {
  background: rgba(226,215,151,0.07);
  border: 1px solid rgba(226,215,151,0.25);
  border-radius: 4px;
  padding: 11px 14px;
  color: #E2D797;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}
.auth-modal__field input::placeholder { opacity: 0.35; color: #E2D797; }
.auth-modal__field input:focus { border-color: rgba(226,215,151,0.7); }

.auth-modal__error {
  font-size: 0.8rem;
  color: #ff9999;
  margin: 0;
  padding: 8px 12px;
  background: rgba(255,0,0,0.12);
  border-radius: 4px;
}

.auth-modal__submit {
  margin-top: 4px;
  width: 100%;
  height: 48px;
  background: rgba(226,215,151,0.12);
  border: 1px solid rgba(226,215,151,0.5);
  border-radius: 40px;
  color: #E2D797;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: all 0.2s;
}
.auth-modal__submit:hover:not(:disabled) {
  background: rgba(226,215,151,0.2);
  border-color: #E2D797;
}
.auth-modal__submit:disabled { opacity: 0.45; cursor: default; }
</style>

