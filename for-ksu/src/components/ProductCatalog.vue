<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import ProductCard from './ProductCard.vue'
import ProductDetail from './ProductDetail.vue'

const PAGE_SIZE = 6

const products = ref([])
const loading = ref(true)
const activeCategory = ref('Все')
const selectedProduct = ref(null)
const visibleCount = ref(PAGE_SIZE)

onMounted(async () => {
  const snap = await getDocs(collection(db, 'products'))
  products.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  loading.value = false
})

watch(activeCategory, () => {
  visibleCount.value = PAGE_SIZE
})

const categories = computed(() => {
  const cats = ['Все', ...new Set(products.value.map(p => p.category))]
  return cats
})

const filtered = computed(() => {
  if (activeCategory.value === 'Все') return products.value
  return products.value.filter(p => p.category === activeCategory.value)
})

const visible = computed(() => filtered.value.slice(0, visibleCount.value))

const hasMore = computed(() => visibleCount.value < filtered.value.length)

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
          <span class="catalog__more-count">({{ filtered.length - visibleCount }} товаров)</span>
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
  margin-bottom: 20px;
}

.catalog__title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #E2D797;
  margin: 0;
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
