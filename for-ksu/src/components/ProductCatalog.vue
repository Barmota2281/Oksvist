<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import ProductCard from './ProductCard.vue'
import ProductDetail from './ProductDetail.vue'

const PAGE_SIZE = 6

const products = ref([])
const loading = ref(true)
const activeCategory = ref('Все')
const selectedProduct = ref(null)
const visibleCount = ref(PAGE_SIZE)
const searchQuery = ref('')
const sortOption = ref('newest') // добавленная сортировка

let unsubs = []

function fetchProducts() {
  loading.value = true

  unsubs.forEach(u => u())
  unsubs = []

  if (!searchQuery.value.trim()) {
    const unsub = onSnapshot(collection(db, 'products'), (snap) => {
      products.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      loading.value = false
    })
    unsubs.push(unsub)
  } else {
    // Реализация поиска через запросы Firestore с подпиской в реальном времени
    const term = searchQuery.value.trim()
    const termCapitalized = term.charAt(0).toUpperCase() + term.slice(1)
    const termLower = term.toLowerCase()

    const queries = [
      query(collection(db, 'products'), where('name', '>=', term), where('name', '<=', term + '\uf8ff')),
      query(collection(db, 'products'), where('name', '>=', termCapitalized), where('name', '<=', termCapitalized + '\uf8ff')),
      query(collection(db, 'products'), where('name', '>=', termLower), where('name', '<=', termLower + '\uf8ff')),
      query(collection(db, 'products'), where('description', '>=', term), where('description', '<=', term + '\uf8ff')),
      query(collection(db, 'products'), where('description', '>=', termCapitalized), where('description', '<=', termCapitalized + '\uf8ff')),
      query(collection(db, 'products'), where('description', '>=', termLower), where('description', '<=', termLower + '\uf8ff'))
    ]

    const snapsMap = new Map()
    let loadedCount = 0

    queries.forEach((q, i) => {
      snapsMap.set(i, new Map())
      const unsub = onSnapshot(q, (snap) => {
        const currentMap = new Map()
        snap.docs.forEach(d => currentMap.set(d.id, { id: d.id, ...d.data() }))
        snapsMap.set(i, currentMap)

        const mergedMap = new Map()
        for (const m of snapsMap.values()) {
          for (const [id, doc] of m.entries()) {
            mergedMap.set(id, doc)
          }
        }
        products.value = Array.from(mergedMap.values())

        loadedCount++
        if (loadedCount >= queries.length) loading.value = false
      })
      unsubs.push(unsub)
    })
  }
}

onMounted(() => {
  fetchProducts()
})

onUnmounted(() => {
  unsubs.forEach(u => u())
})

watch(activeCategory, () => {
  visibleCount.value = PAGE_SIZE
})

function handleSearch() {
  activeCategory.value = 'Все'
  fetchProducts()
}

const categories = computed(() => {
  const cats = ['Все', ...new Set(products.value.map(p => p.category))]
  return cats
})

const filteredAndSorted = computed(() => {
  let result = products.value

  if (activeCategory.value !== 'Все') {
    result = result.filter(p => p.category === activeCategory.value)
  }

  // Применяем сортировку
  result = [...result].sort((a, b) => {
    if (sortOption.value === 'newest') {
      const timeA = a.created_at?.seconds || 0
      const timeB = b.created_at?.seconds || 0
      return timeB - timeA
    }
    if (sortOption.value === 'oldest') {
      const timeA = a.created_at?.seconds || 0
      const timeB = b.created_at?.seconds || 0
      return timeA - timeB
    }
    if (sortOption.value === 'price_asc') {
      return (a.price || 0) - (b.price || 0)
    }
    if (sortOption.value === 'price_desc') {
      return (b.price || 0) - (a.price || 0)
    }
    if (sortOption.value === 'rating') {
      return (b.rating || 0) - (a.rating || 0)
    }
    return 0
  })

  return result
})

const visible = computed(() => filteredAndSorted.value.slice(0, visibleCount.value))

const hasMore = computed(() => visibleCount.value < filteredAndSorted.value.length)

function showMore() {
  visibleCount.value += PAGE_SIZE
}

function openProduct(product) {
  selectedProduct.value = product
}
function closeProduct() {
  selectedProduct.value = null
}
</script>

<template>
  <section class="catalog">
    <div class="catalog__header">
      <h2 class="catalog__title">{{ activeCategory === 'Все' ? 'Все товары' : activeCategory }}</h2>
      <div class="catalog__controls">
        <div class="catalog__search">
          <input
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="Поиск по названию..."
            class="catalog__search-input"
          />
          <button @click="handleSearch" class="catalog__search-btn">Искать</button>
        </div>
        <div class="catalog__sort">
          <select v-model="sortOption" class="catalog__sort-select">
            <option value="newest">Сначала новые</option>
            <option value="oldest">Сначала старые</option>
            <option value="price_asc">Сначала дешевые</option>
            <option value="price_desc">Сначала дорогие</option>
            <option value="rating">По рейтингу</option>
          </select>
        </div>
      </div>
    </div>

    <div class="catalog__cats">
      <button
        v-for="cat in categories"
        :key="cat"
        class="catalog__cat-btn"
        :class="{ active: activeCategory === cat }"
        @click="activeCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <div v-if="loading" class="catalog__loading">
      <span>Загрузка...</span>
    </div>

    <template v-else>
      <div class="catalog__grid">
        <ProductCard
          v-for="product in visible"
          :key="product.id"
          :product="product"
          @open="openProduct"
        />
      </div>

      <div v-if="hasMore" class="catalog__more-wrap">
        <button class="catalog__more-btn" @click="showMore">
          ПОКАЗАТЬ ЕЩЁ
          <span class="catalog__more-count">({{ filteredAndSorted.length - visibleCount }} товаров)</span>
        </button>
      </div>
    </template>
  </section>

  <Teleport to="body">
    <transition name="detail-fade">
      <ProductDetail
        v-if="selectedProduct"
        :product="selectedProduct"
        @close="closeProduct"
      />
    </transition>
  </Teleport>
</template>

<style scoped>
.catalog {
  padding: 40px 48px;
}

.catalog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.catalog__title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #E2D797;
  margin: 0;
}

.catalog__controls {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.catalog__search {
  display: flex;
  gap: 8px;
}

.catalog__search-input {
  background: transparent;
  border: 1px solid rgba(226,215,151,0.5);
  border-radius: 20px;
  padding: 8px 16px;
  color: #E2D797;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
}

.catalog__search-input:focus {
  border-color: #E2D797;
}

.catalog__search-input::placeholder {
  color: rgba(226,215,151,0.5);
}

.catalog__search-btn {
  background: rgba(226,215,151,0.1);
  border: 1px solid #E2D797;
  border-radius: 20px;
  padding: 8px 16px;
  color: #E2D797;
  cursor: pointer;
  transition: all 0.2s;
}

.catalog__search-btn:hover {
  background: rgba(226,215,151,0.2);
}

.catalog__sort-select {
  background: rgba(226,215,151,0.1);
  border: 1px solid rgba(226,215,151,0.5);
  border-radius: 20px;
  padding: 8px 16px;
  color: #E2D797;
  outline: none;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  appearance: none;
}

.catalog__sort-select:focus {
  border-color: #E2D797;
}

.catalog__sort-select option {
  background: #6E1920;
  color: #E2D797;
}

.catalog__cats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
  border-top: 1px solid #5a1717;
  border-bottom: 1px solid #5a1717;
  padding: 12px 0;
}
.catalog__cat-btn {
  background: none;
  border: 1px solid transparent;
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 0.8rem;
  color: #E2D797;
  opacity: 0.6;
  cursor: pointer;
  transition: all 0.2s;
}
.catalog__cat-btn:hover { opacity: 1; }
.catalog__cat-btn.active {
  border-color: #E2D797;
  opacity: 1;
  background: rgba(226,215,151,0.08);
}

.catalog__loading {
  text-align: center;
  color: #E2D797;
  opacity: 0.6;
  padding: 60px 0;
  font-size: 1rem;
}

.catalog__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
}

.catalog__more-wrap {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}
.catalog__more-btn {
  background: none;
  border: 1px solid rgba(226,215,151,0.5);
  border-radius: 40px;
  padding: 14px 40px;
  color: #E2D797;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}
.catalog__more-btn:hover {
  background: rgba(226,215,151,0.08);
  border-color: #E2D797;
}
.catalog__more-count {
  font-weight: 400;
  opacity: 0.6;
  font-size: 0.72rem;
}

@media (max-width: 1100px) {
  .catalog__grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .catalog { padding: 24px 16px; }
  .catalog__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .catalog__grid { grid-template-columns: 1fr; }
}
</style>
