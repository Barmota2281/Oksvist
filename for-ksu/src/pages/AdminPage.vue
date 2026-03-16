<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore'

const activeTab = ref('dashboard') // dashboard, products, orders, users, reviews

// Data
const products = ref([])
const orders = ref([])
const users = ref([])
const reviews = ref([])

const loading = ref(false)

// Dashboard Stats
const totalRevenue = computed(() => orders.value.reduce((sum, o) => sum + (o.total || 0), 0))
const totalOrders = computed(() => orders.value.length)
const totalUsers = computed(() => users.value.length)
const totalProducts = computed(() => products.value.length)

// --- PRODUCTS ---
const isProductModalOpen = ref(false)
const editingProduct = ref(null)
const productForm = ref({
  name: '',
  price: 0,
  category: '',
  stock: 0,
  description: '',
  image: '',
  sizes: '', // comma separated in form
  colors: '' // comma separated in form
})

function openAddProduct() {
  editingProduct.value = null
  productForm.value = { name: '', price: 0, category: '', stock: 0, description: '', image: '', sizes: '', colors: '' }
  isProductModalOpen.value = true
}

function openEditProduct(prod) {
  editingProduct.value = prod
  productForm.value = {
    name: prod.name,
    price: prod.price,
    category: prod.category,
    stock: prod.stock,
    description: prod.description,
    image: prod.images?.[0] || '',
    sizes: prod.sizes ? prod.sizes.join(', ') : '',
    colors: prod.colors ? prod.colors.join(', ') : ''
  }
  isProductModalOpen.value = true
}

async function saveProduct() {
  const data = {
    name: productForm.value.name,
    price: Number(productForm.value.price),
    category: productForm.value.category,
    stock: Number(productForm.value.stock),
    description: productForm.value.description,
    images: [productForm.value.image],
    sizes: productForm.value.sizes.split(',').map(s => s.trim()).filter(Boolean),
    colors: productForm.value.colors.split(',').map(c => c.trim()).filter(Boolean),
    updated_at: serverTimestamp()
  }

  try {
    if (editingProduct.value) {
      await updateDoc(doc(db, 'products', editingProduct.value.id), data)
    } else {
      data.created_at = serverTimestamp()
      data.rating = 0
      await addDoc(collection(db, 'products'), data)
    }
    isProductModalOpen.value = false
    await fetchData()
  } catch (e) {
    alert('Ошибка: ' + e.message)
  }
}

async function removeProduct(id) {
  if (!confirm('Удалить товар?')) return
  await deleteDoc(doc(db, 'products', id))
  await fetchData()
}

// --- ORDERS ---
async function updateOrderStatus(order, status) {
  await updateDoc(doc(db, 'orders', order.id), { status })
  order.status = status
}

// --- USERS ---
async function updateUserRole(user, role) {
  await updateDoc(doc(db, 'users', user.id), { role })
  user.role = role
}

// --- REVIEWS ---
async function removeReview(id) {
  if (!confirm('Удалить отзыв?')) return
  await deleteDoc(doc(db, 'reviews', id))
  reviews.value = reviews.value.filter(r => r.id !== id)
}

async function fetchData() {
  loading.value = true
  try {
    // Products
    const pSnap = await getDocs(collection(db, 'products'))
    products.value = pSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    // Orders
    const oSnap = await getDocs(query(collection(db, 'orders'), orderBy('created_at', 'desc')))
    orders.value = oSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    // Users
    const uSnap = await getDocs(collection(db, 'users'))
    users.value = uSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    // Reviews
    const rSnap = await getDocs(query(collection(db, 'reviews'), orderBy('created_at', 'desc')))
    reviews.value = rSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

function formatPrice(val) {
  return Number(val).toLocaleString('ru-RU')
}
function formatDate(ts) {
  if (!ts) return ''
  return new Date(ts.seconds * 1000).toLocaleString()
}
</script>

<template>
  <div class="admin-page">
    <aside class="admin-sidebar">
      <h2 class="admin-title">Admin Panel</h2>
      <nav class="admin-nav">
        <button :class="{ active: activeTab === 'dashboard' }" @click="activeTab = 'dashboard'">Главная</button>
        <button :class="{ active: activeTab === 'products' }" @click="activeTab = 'products'">Товары</button>
        <button :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'">Заказы</button>
        <button :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">Пользователи</button>
        <button :class="{ active: activeTab === 'reviews' }" @click="activeTab = 'reviews'">Отзывы</button>
      </nav>
    </aside>

    <main class="admin-content">
      <div v-if="loading" class="loading">Загрузка...</div>

      <!-- DASHBOARD -->
      <div v-else-if="activeTab === 'dashboard'" class="dashboard">
        <div class="stat-card">
          <h3>Выручка</h3>
          <p class="stat-val">{{ formatPrice(totalRevenue) }} ₸</p>
        </div>
        <div class="stat-card">
          <h3>Заказы</h3>
          <p class="stat-val">{{ totalOrders }}</p>
        </div>
        <div class="stat-card">
          <h3>Пользователи</h3>
          <p class="stat-val">{{ totalUsers }}</p>
        </div>
        <div class="stat-card">
          <h3>Товары</h3>
          <p class="stat-val">{{ totalProducts }}</p>
        </div>
      </div>

      <!-- PRODUCTS -->
      <div v-else-if="activeTab === 'products'" class="products-tab">
        <div class="tab-header">
          <h2>Управление товарами</h2>
          <button class="add-btn" @click="openAddProduct">+ Добавить товар</button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Img</th>
              <th>Название</th>
              <th>Цена</th>
              <th>Stock</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in products" :key="p.id">
              <td><img :src="p.images?.[0]" class="tbl-img" /></td>
              <td>{{ p.name }}</td>
              <td>{{ formatPrice(p.price) }}</td>
              <td>{{ p.stock }}</td>
              <td>
                <button class="sm-btn" @click="openEditProduct(p)">Edit</button>
                <button class="sm-btn del" @click="removeProduct(p.id)">Del</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ORDERS -->
      <div v-else-if="activeTab === 'orders'" class="orders-tab">
        <h2>Управление заказами</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Клиент ID</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id">
              <td>{{ o.id.slice(0, 8) }}</td>
              <td :title="o.user_id">{{ o.user_id.slice(0, 8) }}...</td>
              <td>{{ formatPrice(o.total) }}</td>
              <td>
                <select :value="o.status" @change="updateOrderStatus(o, $event.target.value)" class="status-select">
                  <option value="new">new</option>
                  <option value="processing">processing</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </td>
              <td>{{ formatDate(o.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- USERS -->
      <div v-else-if="activeTab === 'users'" class="users-tab">
        <h2>Пользователи</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Имя</th>
              <th>Роль</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>{{ u.email }}</td>
              <td>{{ u.display_name }}</td>
              <td>
                <select :value="u.role" @change="updateUserRole(u, $event.target.value)" class="status-select">
                  <option value="customer">customer</option>
                  <option value="admin">admin</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- REVIEWS -->
      <div v-else-if="activeTab === 'reviews'" class="reviews-tab">
        <h2>Модерация отзывов</h2>
        <div v-for="r in reviews" :key="r.id" class="review-item">
          <div class="review-head">
            <strong>{{ r.user_name }}</strong> &nbsp;
            <span>Rating: {{ r.rating }}</span> &nbsp;
            <small>{{ formatDate(r.created_at) }}</small>
          </div>
          <p>{{ r.comment }}</p>
          <button class="sm-btn del" @click="removeReview(r.id)">Удалить</button>
        </div>
      </div>
    </main>

    <!-- Product Modal -->
    <div v-if="isProductModalOpen" class="modal-overlay" @click.self="isProductModalOpen = false">
      <div class="modal">
        <h3>{{ editingProduct ? 'Редактировать' : 'Добавить' }} товар</h3>
        <div class="form-grid">
          <label>Название <input v-model="productForm.name"></label>
          <label>Цена <input type="number" v-model="productForm.price"></label>
          <label>Категория <input v-model="productForm.category"></label>
          <label>Кол-во <input type="number" v-model="productForm.stock"></label>
          <label>Image URL <input v-model="productForm.image"></label>
          <label>Sizes (через запятую) <input v-model="productForm.sizes"></label>
          <label>Colors (через запятую) <input v-model="productForm.colors"></label>
          <label class="full">Описание <textarea v-model="productForm.description"></textarea></label>
        </div>
        <div class="modal-actions">
          <button @click="saveProduct">Сохранить</button>
          <button class="cancel" @click="isProductModalOpen = false">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  display: flex;
  min-height: 100vh;
  margin-top: 60px; /* header space */
  color: #E2D797;
  font-family: sans-serif;
}

.admin-sidebar {
  width: 220px;
  background: #5a1717;
  padding: 20px;
  flex-shrink: 0;
}

.admin-title {
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: #fff;
}

.admin-nav button {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 10px;
  color: #E2D797;
  cursor: pointer;
  border-left: 3px solid transparent;
}
.admin-nav button.active {
  background: rgba(0,0,0,0.2);
  border-left-color: #E2D797;
}

.admin-content {
  flex: 1;
  padding: 20px;
  background: #6E1920;
  overflow-x: auto;
}

/* Dashboard */
.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
.stat-card {
  background: rgba(0,0,0,0.2);
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}
.stat-val { font-size: 1.5rem; font-weight: bold; margin-top: 10px; }

/* Tables */
.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background: rgba(0,0,0,0.1);
}
.data-table th, .data-table td {
  padding: 10px;
  border: 1px solid rgba(226, 215, 151, 0.2);
  text-align: left;
}
.tbl-img {
  width: 40px;
  height: 40px;
  object-fit: cover;
}

/* Forms & Buttons */
.add-btn {
  background: #E2D797;
  color: #6E1920;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.sm-btn {
  background: #E2D797;
  color: #6E1920;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 4px;
}
.sm-btn.del { background: #8b3a3a; color: #fff; }

.status-select {
  background: rgba(0,0,0,0.3);
  color: #E2D797;
  border: 1px solid #E2D797;
  padding: 4px;
}

/* Reviews */
.review-item {
  background: rgba(0,0,0,0.2);
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 6px;
}
.review-head { margin-bottom: 6px; font-size: 0.9rem; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: #6E1920;
  border: 1px solid #E2D797;
  padding: 20px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 20px 0;
}
.full { grid-column: span 2; }
label { display: flex; flex-direction: column; font-size: 0.8rem; gap: 4px; }
input, textarea {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(226, 215, 151, 0.4);
  color: #E2D797;
  padding: 6px;
}
.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
.modal-actions button {
  background: #E2D797;
  color: #6E1920;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
}
.modal-actions button.cancel {
  background: transparent;
  border: 1px solid #E2D797;
  color: #E2D797;
}
</style>

