<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { db } from '../firebase'
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { useRoute } from 'vue-router'

const authStore = useAuthStore()
const route = useRoute()

const activeTab = ref(route.query.tab || 'profile') // 'profile', 'orders', 'reviews'
const orders = ref([])
const reviews = ref([])
const productNames = ref({}) // Cache for product names in reviews

let unsubOrders = null
let unsubReviews = null

const isEditing = ref(false)
const editForm = ref({
  displayName: '',
  phone: ''
})

const displayName = computed(() => authStore.user?.display_name || 'Пользователь')
const email = computed(() => authStore.user?.email || '-')
const phone = computed(() => authStore.user?.phone || 'Не указан')
const role = computed(() => authStore.user?.role || 'customer')

onMounted(() => {
  if (!authStore.user?.uid) return

  // Orders
  const ordersQuery = query(
    collection(db, 'orders'),
    where('user_id', '==', authStore.user.uid)
  )
  unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    list.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0))
    orders.value = list
  })

  // Reviews
  const reviewsQuery = query(
    collection(db, 'reviews'),
    where('user_id', '==', authStore.user.uid)
  )
  unsubReviews = onSnapshot(reviewsQuery, async (snapshot) => {
    const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    list.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0))
    reviews.value = list
    // Load product names for reviews
    for (const r of list) {
      if (!productNames.value[r.product_id]) {
        const pSnap = await getDoc(doc(db, 'products', r.product_id))
        if (pSnap.exists()) productNames.value[r.product_id] = pSnap.data().name
      }
    }
  })
})

watch(() => route.query.tab, (newTab) => {
  if (newTab) activeTab.value = newTab
})

onUnmounted(() => {
  if (unsubOrders) unsubOrders()
  if (unsubReviews) unsubReviews()
})

function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
  })
}

function formatPrice(val) {
  return Number(val).toLocaleString('ru-RU')
}

// Review management
const editingReviewId = ref(null)
const editReviewText = ref('')
const editReviewRating = ref(5)

// New review management
const selectedProductToReview = ref(null)
const newReviewRating = ref(5)
const newReviewComment = ref('')

// Order details expansion
const expandedOrderIds = ref(new Set())
function toggleOrderDetails(orderId) {
  if (expandedOrderIds.value.has(orderId)) {
    expandedOrderIds.value.delete(orderId)
  } else {
    expandedOrderIds.value.add(orderId)
  }
}

const unreviewedProducts = computed(() => {
  const reviewedProductIds = new Set(reviews.value.map(r => r.product_id))
  const productsMap = new Map()

  orders.value.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        if (!reviewedProductIds.has(item.product_id)) {
          if (!productsMap.has(item.product_id)) {
            productsMap.set(item.product_id, {
              id: item.product_id,
              name: item.name,
              image: item.image
            })
          }
        }
      })
    }
  })
  return Array.from(productsMap.values())
})

function openNewReviewForm(product) {
  selectedProductToReview.value = product
  newReviewRating.value = 5
  newReviewComment.value = ''
}

async function submitNewReview() {
  if (!selectedProductToReview.value || !newReviewComment.value.trim()) return

  try {
    await addDoc(collection(db, 'reviews'), {
      product_id: selectedProductToReview.value.id,
      user_id: authStore.user.uid,
      user_name: authStore.user.display_name || 'Пользователь',
      rating: newReviewRating.value,
      comment: newReviewComment.value,
      created_at: serverTimestamp()
    })
    selectedProductToReview.value = null
  } catch (e) {
    console.error('Failed to add review:', e)
  }
}

function startEditReview(review) {
  editingReviewId.value = review.id
  editReviewText.value = review.comment
  editReviewRating.value = review.rating
}

async function saveReview(reviewId) {
  try {
    await updateDoc(doc(db, 'reviews', reviewId), {
      comment: editReviewText.value,
      rating: editReviewRating.value
    })
    editingReviewId.value = null
  } catch (e) {
    console.error('Failed to update review:', e)
  }
}

async function removeReview(reviewId) {
  if (!confirm('Удалить отзыв?')) return
  try {
    await deleteDoc(doc(db, 'reviews', reviewId))
  } catch (e) {
    console.error('Failed to delete review:', e)
  }
}

// Initialize form when editing starts
watch(isEditing, (newVal) => {
  if (newVal) {
    editForm.value.displayName = displayName.value
    editForm.value.phone = phone.value === 'Не указан' ? '' : phone.value
  }
})

async function saveProfile() {
  try {
    await authStore.updateUserData({
      displayName: editForm.value.displayName,
      phone: editForm.value.phone
    })
    isEditing.value = false
  } catch (e) {
    console.error('Failed to update profile:', e)
  }
}
</script>

<template>
  <section class="profile-page">
    <div class="profile-container">
      <div class="profile-sidebar">
        <button
          :class="['tab-btn', { active: activeTab === 'profile' }]"
          @click="activeTab = 'profile'"
        >Профиль</button>
        <button
          :class="['tab-btn', { active: activeTab === 'orders' }]"
          @click="activeTab = 'orders'"
        >Мои заказы</button>
        <button
          :class="['tab-btn', { active: activeTab === 'reviews' }]"
          @click="activeTab = 'reviews'"
        >Мои отзывы</button>
      </div>

      <div class="profile-content">
        <!-- PROFILE TAB -->
        <div v-if="activeTab === 'profile'" class="profile-card">
          <div class="profile-card__header">
            <h1 class="profile-card__title">Личный кабинет</h1>
            <button v-if="!isEditing" @click="isEditing = true" class="edit-btn">Редактировать</button>
          </div>

          <div v-if="!isEditing">

            <p class="profile-card__name">Имя: <strong>{{ displayName }}</strong></p>

            <div class="profile-card__row">
              <span>Email: </span>
              <strong>{{ email }}</strong>
            </div>

            <div class="profile-card__row">
              <span>Телефон : </span>
              <strong>{{ phone }}</strong>
            </div>

            <div class="profile-card__row">
              <span>Роль: </span>
              <strong>{{ role }}</strong>
            </div>
          </div>

          <div v-else class="edit-form">
            <div class="form-group">
              <label>Имя</label>
              <input type="text" v-model="editForm.displayName" class="form-input" />
            </div>

            <div class="form-group">
              <label>Телефон</label>
              <input type="tel" v-model="editForm.phone" class="form-input" placeholder="+7..." />
            </div>

            <div class="form-actions">
              <button @click="saveProfile" class="save-btn">Сохранить</button>
              <button @click="isEditing = false" class="cancel-btn">Отмена</button>
            </div>
          </div>
        </div>

        <!-- ORDERS TAB -->
        <div v-else-if="activeTab === 'orders'" class="orders-list">
          <h2 class="section-title">История заказов</h2>
          <div v-if="orders.length === 0" class="empty-state">Нет заказов</div>
          <div v-for="order in orders" :key="order.id" class="order-card">
            <div class="order-header">
              <span class="order-id">Заказ #{{ order.id.slice(0, 8) }}</span>
              <span class="order-date">{{ formatDate(order.created_at) }}</span>
            </div>

            <div v-if="!expandedOrderIds.has(order.id)" class="order-items">
              <div v-for="item in order.items" :key="item.id" class="order-item-row">
                <span>{{ item.name }} x {{ item.quantity }}</span>
                <span>{{ formatPrice(item.price * item.quantity) }} ₸</span>
              </div>
            </div>

            <div v-else class="order-details-expanded">
              <div v-for="(item, idx) in order.items" :key="idx" class="expanded-item">
                <div class="expanded-item-img">
                  <img v-if="item.image && !item.image.includes('example.com')" :src="item.image" :alt="item.name" />
                  <div v-else class="expanded-placeholder"></div>
                </div>
                <div class="expanded-item-info">
                  <span class="expanded-name">{{ item.name }}</span>
                  <span class="expanded-meta" v-if="item.size || item.color">
                    {{ item.size ? item.size : '' }}{{ (item.size && item.color) ? ' / ' : '' }}{{ item.color ? item.color : '' }}
                  </span>
                  <span class="expanded-price">
                    {{ item.quantity }} шт. x {{ formatPrice(item.price) }} ₸ = {{ formatPrice(item.quantity * item.price) }} ₸
                  </span>
                </div>
              </div>
            </div>

            <div class="order-footer">
              <div class="order-total">
                Итого: <strong>{{ formatPrice(order.total) }} ₸</strong>
              </div>
              <button @click="toggleOrderDetails(order.id)" class="toggle-btn">
                {{ expandedOrderIds.has(order.id) ? 'Свернуть детали' : 'Подробнее о заказе' }}
              </button>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab === 'reviews'" class="reviews-list">
          <h2 class="section-title">Мои отзывы</h2>
          <div v-if="reviews.length === 0" class="empty-state">Нет отзывов</div>
          <div v-for="review in reviews" :key="review.id" class="review-card">
            <div class="review-header">
              <span class="review-product">{{ productNames[review.product_id] || 'Товар' }}</span>
              <span class="review-date">{{ formatDate(review.created_at) }}</span>
            </div>

            <div v-if="editingReviewId === review.id" class="review-edit-form">
              <div class="rating-select">
                <label>Оценка:</label>
                <div class="stars-select">
                  <span
                    v-for="n in 5"
                    :key="n"
                    class="star-select-item"
                    :class="{ filled: n <= editReviewRating }"
                    @click="editReviewRating = n"
                  >★</span>
                </div>
              </div>
              <textarea v-model="editReviewText" class="form-input" rows="3"></textarea>
              <div class="form-actions">
                <button @click="saveReview(review.id)" class="save-btn">Сохранить</button>
                <button @click="editingReviewId = null" class="cancel-btn">Отмена</button>
              </div>
            </div>

            <div v-else>
              <div class="review-rating">Rating: {{ review.rating }}/5</div>
              <p class="review-text">{{ review.comment }}</p>
              <div class="review-actions">
                <button @click="startEditReview(review)" class="edit-btn-sm">Изменить</button>
                <button @click="removeReview(review.id)" class="del-btn-sm">Удалить</button>
              </div>
            </div>
          </div>

          <div v-if="unreviewedProducts.length > 0" class="new-reviews-section" style="margin-top: 40px;">
            <h3 class="section-title">Оставить отзыв</h3>

            <div v-for="product in unreviewedProducts" :key="product.id" class="review-card">
              <div class="review-header" :style="selectedProductToReview?.id !== product.id ? 'margin-bottom:0' : ''">
                <span class="review-product">{{ product.name }}</span>
                <button
                  v-if="selectedProductToReview?.id !== product.id"
                  @click="openNewReviewForm(product)"
                  class="edit-btn-sm"
                >Написать отзыв</button>
              </div>

              <div v-if="selectedProductToReview?.id === product.id" class="review-edit-form" style="margin-top: 15px;">
                <div class="rating-select">
                  <label>Оценка:</label>
                  <div class="stars-select">
                    <span
                      v-for="n in 5"
                      :key="n"
                      class="star-select-item"
                      :class="{ filled: n <= newReviewRating }"
                      @click="newReviewRating = n"
                    >★</span>
                  </div>
                </div>
                <textarea v-model="newReviewComment" class="form-input" rows="3" placeholder="Ваш отзыв..."></textarea>
                <div class="form-actions">
                  <button @click="submitNewReview" class="save-btn">Отправить</button>
                  <button @click="selectedProductToReview = null" class="cancel-btn">Отмена</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.profile-page {
  min-height: calc(100vh - 100px);
  padding: 40px 20px;
  display: flex;
  justify-content: center;
}

.profile-container {
  display: flex;
  gap: 30px;
  width: 100%;
  max-width: 1000px;
  align-items: flex-start;
}

.profile-sidebar {
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.profile-content {
  flex: 1;
}

.tab-btn {
  background: transparent;
  border: none;
  text-align: left;
  padding: 10px 15px;
  color: #E2D797;
  font-size: 1.1rem;
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: all 0.3s;
}

.tab-btn:hover {
  background: rgba(226, 215, 151, 0.1);
}

.tab-btn.active {
  border-left-color: #E2D797;
  background: rgba(226, 215, 151, 0.15);
  font-weight: bold;
}

/* Common Card Styles */
.profile-card, .order-card, .review-card {
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(226, 215, 151, 0.25);
  border-radius: 14px;
  padding: 22px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #E2D797;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: rgba(226, 215, 151, 0.5);
}

/* Orders */
.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(226, 215, 151, 0.2);
}

.order-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.1);
}
.order-status.new { color: #81c784; background: rgba(129, 199, 132, 0.2); }
.order-status.processing { color: #fff176; background: rgba(255, 241, 118, 0.2); }
.order-status.completed { color: #64b5f6; background: rgba(100, 181, 246, 0.2); }

.order-items {
  margin-bottom: 15px;
}

.order-item-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  margin-bottom: 6px;
  color: rgba(226, 215, 151, 0.9);
}

.order-total {
  text-align: right;
  font-size: 1.1rem;
}

/* Reviews */
.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.review-product {
  font-weight: bold;
  font-size: 1.1rem;
}

.review-date {
  font-size: 0.9rem;
  opacity: 0.7;
}

.review-text {
  color: #E2D797;
  font-size: 0.95rem;
  line-height: 1.4;
}

.review-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.edit-btn-sm, .del-btn-sm {
  background: transparent;
  border: 1px solid rgba(226, 215, 151, 0.3);
  color: #E2D797;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.del-btn-sm:hover {
  background: rgba(255, 0, 0, 0.2);
  border-color: rgba(255, 0, 0, 0.3);
}

.edit-btn-sm:hover {
  background: rgba(226, 215, 151, 0.1);
}

/* Edit Mode Reused */
.edit-btn, .save-btn, .cancel-btn {
  background: transparent;
  border: 1px solid #E2D797;
  color: #E2D797;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}
.edit-btn:hover, .save-btn:hover, .cancel-btn:hover {
  background: rgba(226, 215, 151, 0.1);
}
.save-btn {
  background: rgba(226, 215, 151, 0.2);
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.9rem;
  color: #E2D797;
}
.form-input {
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(226, 215, 151, 0.3);
  border-radius: 6px;
  color: #E2D797;
  font-size: 1rem;
}
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

/* Rating Stars */
.rating-select {
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
  color: #E2D797;
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

/* Order Details */
.order-details-expanded {
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.expanded-item {
  display: flex;
  gap: 12px;
  background: rgba(0,0,0,0.2);
  padding: 10px;
  border-radius: 8px;
  align-items: center;
}

.expanded-item-img {
  width: 60px;
  height: 80px;
  flex-shrink: 0;
  background: #3a1111;
  border-radius: 4px;
  overflow: hidden;
}

.expanded-item-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.expanded-placeholder {
  width: 100%;
  height: 100%;
}

.expanded-item-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.expanded-name {
  font-weight: bold;
  font-size: 0.95rem;
  color: #E2D797;
}

.expanded-meta {
  font-size: 0.85rem;
  opacity: 0.7;
  color: #E2D797;
}

.expanded-price {
  font-size: 0.9rem;
  font-weight: bold;
  color: #E2D797;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(226, 215, 151, 0.2);
  margin-top: 10px;
  padding-top: 10px;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 0.9rem;
  color: #E2D797;
  opacity: 0.8;
  cursor: pointer;
  text-decoration: underline;
}

.toggle-btn:hover {
  opacity: 1;
}

/* Update responsive */
@media (max-width: 768px) {
  .profile-container {
    flex-direction: column;
  }
  .profile-sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
  }
  .tab-btn {
    border-left: none;
    border-bottom: 2px solid transparent;
  }
  .tab-btn.active {
    border-bottom-color: #E2D797;
    background: transparent;
  }
}
</style>
