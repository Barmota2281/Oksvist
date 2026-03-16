<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { db } from '../firebase'
import { collection, query, where, addDoc, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore'

const props = defineProps({
  product: { type: Object, required: true }
})
const emit = defineEmits(['close'])

const cartStore = useCartStore()
const authStore = useAuthStore()

const reviews = ref([])
const newReview = ref({ rating: 5, comment: '' })
const showReviewForm = ref(false)
let unsubReviews = null

// Load reviews
const reviewsQuery = query(
  collection(db, 'reviews'),
  where('product_id', '==', props.product.id),
  orderBy('created_at', 'desc')
)

onMounted(() => {
  unsubReviews = onSnapshot(reviewsQuery, (snapshot) => {
    reviews.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  })
})

onUnmounted(() => {
  if (unsubReviews) unsubReviews()
})

async function submitReview() {
  if (!authStore.isLoggedIn) return
  if (!newReview.value.comment.trim()) return

  try {
    await addDoc(collection(db, 'reviews'), {
      product_id: props.product.id,
      user_id: authStore.user.uid,
      user_name: authStore.user.display_name || 'Пользователь',
      rating: newReview.value.rating,
      comment: newReview.value.comment,
      created_at: serverTimestamp()
    })
    newReview.value = { rating: 5, comment: '' }
    showReviewForm.value = false
  } catch (e) {
    console.error('Error adding review:', e)
  }
}

const selectedSize = ref(null)
const selectedColor = ref(null)
const currentImg = ref(0)
const addedMsg = ref(false)
const needAuth = ref(false)
const needSize = ref(false)

const images = computed(() => {
  if (
    props.product?.images &&
    props.product.images.length > 0 &&
    !props.product.images[0].includes('example.com')
  ) {
    return props.product.images
  }
  return null
})

const isSoldOut = computed(() => Number(props.product?.stock) === 0)

const formattedPrice = computed(() => {
  const p = Number(props.product?.price)
  return isNaN(p) ? '—' : p.toLocaleString('ru-RU') + '.00'
})

function selectSize(size) {
  if (!isSoldOut.value) {
    selectedSize.value = size
    needSize.value = false
  }
}

function selectColor(color) {
  selectedColor.value = color
}

async function addToCart() {
  needAuth.value = false
  needSize.value = false

  if (!authStore.isLoggedIn) {
    needAuth.value = true
    return
  }
  if (!selectedSize.value && props.product?.sizes?.length) {
    needSize.value = true
    return
  }

  const size = selectedSize.value || '—'
  const color = selectedColor.value || props.product?.colors?.[0] || '—'

  await cartStore.addItem(props.product, size, color)
  addedMsg.value = true
  setTimeout(() => { addedMsg.value = false }, 2000)
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

        <div v-if="!images || images.length <= 1" class="detail__dots" style="display:none"></div>
      </div>

      <div class="detail__right">
        <div class="detail__title-row">
          <h1 class="detail__title">{{ product.name }}</h1>
          <span v-if="isSoldOut" class="detail__badge">РАСПРОДАНО</span>
        </div>

        <p class="detail__price">₸{{ formattedPrice }}</p>

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
        <p v-if="needSize" class="detail__hint">Пожалуйста, выберите размер</p>

        <div v-if="product.colors && product.colors.length" class="detail__color-section">
          <div class="detail__sizes-label">Выберите цвет</div>
          <div class="detail__colors-btns">
            <button
              v-for="color in product.colors"
              :key="color"
              class="detail__color-btn"
              :class="{ active: selectedColor === color }"
              @click="selectColor(color)"
            >{{ color }}</button>
          </div>
        </div>

        <p v-if="needAuth" class="detail__hint">Войдите, чтобы добавить в корзину</p>

        <button
          class="detail__cart-btn"
          :class="{ soldout: isSoldOut, added: addedMsg }"
          :disabled="isSoldOut"
          @click="addToCart"
        >
          <span v-if="addedMsg">✓ ДОБАВЛЕНО</span>
          <span v-else-if="isSoldOut">РАСПРОДАНО</span>
          <span v-else>ДОБАВИТЬ В КОРЗИНУ</span>
        </button>


        <p class="detail__desc">{{ product.description }}</p>

        <div class="detail__meta">
          <span class="detail__category">Категория: {{ product.category }}</span>
          <span v-if="product.stock > 0" class="detail__stock">В наличии: {{ product.stock }} шт.</span>
        </div>

        <div class="detail__reviews-section">
          <div class="reviews-header">
            <h3>Отзывы ({{ reviews.length }})</h3>
            <button
              v-if="authStore.isLoggedIn && !showReviewForm"
              @click="showReviewForm = true"
              class="add-review-btn"
            >
              Написать отзыв
            </button>
          </div>

          <div v-if="showReviewForm" class="review-form">
            <div class="rating-input">
              <span>Ваша оценка:</span>
              <div class="stars-select">
                <span
                  v-for="n in 5"
                  :key="n"
                  class="star-select-item"
                  :class="{ filled: n <= newReview.rating }"
                  @click="newReview.rating = n"
                >★</span>
              </div>
            </div>
            <textarea
              v-model="newReview.comment"
              placeholder="Напишите ваш отзыв..."
              rows="3"
            ></textarea>
            <div class="form-actions">
              <button @click="submitReview" class="submit-btn">Отправить</button>
              <button @click="showReviewForm = false" class="cancel-btn">Отмена</button>
            </div>
          </div>

          <div class="reviews-list">
            <p v-if="reviews.length === 0" class="no-reviews">Нет отзывов. Будьте первым!</p>
            <div v-for="review in reviews" :key="review.id" class="review-item">
              <div class="review-top">
                <span class="review-author">{{ review.user_name }}</span>
                <span class="review-stars">
                  <span v-for="n in 5" :key="n" :class="{ filled: n <= review.rating }">★</span>
                </span>
              </div>
              <p class="review-date" v-if="review.created_at">
                {{ new Date(review.created_at.seconds * 1000).toLocaleDateString() }}
              </p>
              <p class="review-text">{{ review.comment }}</p>
            </div>
          </div>
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
  background: #6E1920;
  border: 1px solid #5a1717;
  border-radius: 4px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-x: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  position: relative;
  box-sizing: border-box;
  scrollbar-width: thin;
  scrollbar-color: #E2D797 rgba(0,0,0,0.2);
}

.detail::-webkit-scrollbar,
.detail *::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.detail::-webkit-scrollbar-thumb,
.detail *::-webkit-scrollbar-thumb {
  background-color: #E2D797;
  border-radius: 4px;
}
.detail::-webkit-scrollbar-track,
.detail *::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.2);
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
  flex-direction: row; /* Changed to row for vertical slider layout */
  gap: 16px;
  padding: 28px 24px;
}

.detail__main-img {
  flex: 1;
  aspect-ratio: 3/4;
  overflow: hidden;
  border-radius: 2px;
  background: #5c1c1c;
  height: fit-content;
}
.detail__main-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.detail__img-wrap { width: 100%; height: 100%; }

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
  flex-direction: column; /* Vertical thumbs */
  gap: 10px;
  width: 70px;
  max-height: 500px; /* Limit height */
  overflow-y: auto;
}

.detail__thumb {
  width: 100%;
  aspect-ratio: 3/4; /* Match aspect ratio of main img */
  height: auto;
  border: 2px solid transparent;
  border-radius: 2px;
  cursor: pointer;
  background: #5c1c1c;
  flex-shrink: 0;
  transition: border-color 0.2s;
}
.detail__thumb.active { border-color: #E2D797; }
.detail__thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

.detail__dots {
  display: none; /* Hide dots as we use vertical slider */
}

@media (max-width: 768px) {
  .detail__left {
    flex-direction: column-reverse; /* Stack normally on mobile (main img top? no column-reverse puts thumbs bottom) */
    /* Or maybe main img top, thumbs bottom horizontal */
    flex-direction: column;
  }
  .detail__thumbs {
    flex-direction: row;
    width: 100%;
    height: auto;
    overflow-x: auto;
  }
  .detail__thumb {
    width: 60px;
    height: 80px;
  }
}

.detail__right {
  padding: 36px 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
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
.detail__cart-btn:hover:not(.soldout):not(.added) {
  background: rgba(226,215,151,0.1);
  border-color: #E2D797;
}
.detail__cart-btn.soldout {
  opacity: 0.35;
  cursor: default;
}
.detail__cart-btn.added {
  background: rgba(226,215,151,0.15);
  border-color: #E2D797;
}

.detail__hint {
  font-size: 0.75rem;
  color: #ffb3b3;
  margin: -4px 0 0;
}

.detail__color-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.detail__colors-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.detail__color-btn {
  font-size: 0.75rem;
  color: #E2D797;
  border: 1px solid rgba(226,215,151,0.3);
  border-radius: 12px;
  padding: 4px 12px;
  background: none;
  cursor: pointer;
  opacity: 0.65;
  transition: all 0.2s;
}
.detail__color-btn:hover { opacity: 1; border-color: rgba(226,215,151,0.7); }
.detail__color-btn.active { opacity: 1; border-color: #E2D797; background: rgba(226,215,151,0.1); }

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
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
  color: #E2D797;
  opacity: 0.6;
}

.detail__reviews-section {
  margin-top: 40px;
  border-top: 1px solid rgba(226, 215, 151, 0.2);
  padding-top: 20px;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.reviews-header h3 {
  color: #E2D797;
  margin: 0;
  font-size: 1.2rem;
}

.add-review-btn {
  background: transparent;
  border: 1px solid #E2D797;
  color: #E2D797;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.add-review-btn:hover {
  background: rgba(226, 215, 151, 0.1);
}

.review-form {
  background: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.rating-input {
  margin-bottom: 10px;
  color: #E2D797;
  display: flex;
  gap: 10px;
  align-items: center;
}

.stars-select {
  display: flex;
  gap: 4px;
}

.star-select-item {
  font-size: 1.5rem;
  cursor: pointer;
  color: #E2D797;
  opacity: 0.3;
  transition: opacity 0.2s, transform 0.1s;
}

.star-select-item:hover {
  transform: scale(1.2);
}

.star-select-item.filled {
  opacity: 1;
}

.review-form textarea {
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(226, 215, 151, 0.3);
  border-radius: 4px;
  color: #E2D797;
  margin-bottom: 10px;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.submit-btn, .cancel-btn {
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-weight: bold;
}

.submit-btn {
  background: #E2D797;
  color: #6E1920;
}

.cancel-btn {
  background: transparent;
  color: #E2D797;
  border: 1px solid rgba(226, 215, 151, 0.3);
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.no-reviews {
  color: #E2D797;
  opacity: 0.5;
  font-style: italic;
}

.review-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 8px;
}

.review-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.review-author {
  color: #E2D797;
  font-weight: bold;
}

.review-stars {
  color: #E2D797;
}

.review-stars span {
  opacity: 0.3;
}
.review-stars span.filled {
  opacity: 1;
}

.review-date {
  font-size: 0.75rem;
  color: #E2D797;
  opacity: 0.5;
  margin-bottom: 6px;
}

.review-text {
  color: #E2D797;
  font-size: 0.95rem;
  line-height: 1.4;
}
</style>

