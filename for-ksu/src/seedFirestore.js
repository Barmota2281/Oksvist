/**
 * Скрипт для создания коллекций и начальных данных в Firestore.
 * Запустите один раз: импортируйте и вызовите seedFirestore() из любого компонента,
 * или запустите через консоль браузера после импорта.
 */

import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── USERS ────────────────────────────────────────────────────────────────────
const users = [
  {
    user_id: "user_001",
    email: "alice@example.com",
    display_name: "Алиса Петрова",
    phone: "+7 900 000-00-01",
    role: "customer",
  },
  {
    user_id: "user_002",
    email: "bob@example.com",
    display_name: "Боб Иванов",
    phone: "+7 900 000-00-02",
    role: "admin",
  },
  {
    user_id: "user_003",
    email: "maria@example.com",
    display_name: "Мария Сидорова",
    phone: "+7 900 000-00-03",
    role: "customer",
  },
  {
    user_id: "user_004",
    email: "dmitry@example.com",
    display_name: "Дмитрий Козлов",
    phone: "+7 900 000-00-04",
    role: "customer",
  },
  {
    user_id: "user_005",
    email: "ekaterina@example.com",
    display_name: "Екатерина Новикова",
    phone: "+7 900 000-00-05",
    role: "customer",
  },
  {
    user_id: "user_006",
    email: "sergey@example.com",
    display_name: "Сергей Морозов",
    phone: "+7 900 000-00-06",
    role: "customer",
  },
];

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
const products = [
  {
    product_id: "prod_001",
    name: "Классическая белая футболка",
    description: "Базовая хлопковая футболка, подходит на каждый день.",
    price: 1490,
    category: "Футболки",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["белый", "чёрный"],
    images: ["https://example.com/img/tshirt_white.jpg"],
    stock: 50,
    rating: 4.5,
  },
  {
    product_id: "prod_002",
    name: "Джинсы slim fit",
    description: "Стильные джинсы зауженного кроя.",
    price: 3990,
    category: "Джинсы",
    sizes: ["28", "30", "32", "34"],
    colors: ["синий", "чёрный"],
    images: ["https://example.com/img/jeans_slim.jpg"],
    stock: 30,
    rating: 4.7,
  },
  {
    product_id: "prod_003",
    name: "Летнее платье",
    description: "Лёгкое платье из натуральной ткани.",
    price: 2990,
    category: "Платья",
    sizes: ["XS", "S", "M", "L"],
    colors: ["красный", "белый", "жёлтый"],
    images: ["https://example.com/img/dress_summer.jpg"],
    stock: 25,
    rating: 4.8,
  },
  {
    product_id: "prod_004",
    name: "Худи оверсайз",
    description: "Тёплое худи свободного кроя из флиса.",
    price: 3490,
    category: "Худи и свитшоты",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["серый меланж", "чёрный", "бежевый"],
    images: ["https://example.com/img/hoodie_oversize.jpg"],
    stock: 40,
    rating: 4.9,
  },
  {
    product_id: "prod_005",
    name: "Спортивные леггинсы",
    description: "Леггинсы для фитнеса и повседневной носки.",
    price: 1990,
    category: "Спортивная одежда",
    sizes: ["XS", "S", "M", "L"],
    colors: ["чёрный", "серый", "розовый"],
    images: ["https://example.com/img/leggings.jpg"],
    stock: 60,
    rating: 4.6,
  },
  {
    product_id: "prod_006",
    name: "Льняная рубашка",
    description: "Лёгкая рубашка изо льна, идеальна для лета.",
    price: 2490,
    category: "Рубашки",
    sizes: ["S", "M", "L", "XL"],
    colors: ["белый", "голубой", "бежевый"],
    images: ["https://example.com/img/linen_shirt.jpg"],
    stock: 35,
    rating: 4.4,
  },
  {
    product_id: "prod_007",
    name: "Кожаная куртка",
    description: "Классическая куртка из экокожи.",
    price: 8990,
    category: "Куртки",
    sizes: ["S", "M", "L", "XL"],
    colors: ["чёрный", "коричневый"],
    images: ["https://example.com/img/leather_jacket.jpg"],
    stock: 15,
    rating: 4.8,
  },
  {
    product_id: "prod_008",
    name: "Трикотажный кардиган",
    description: "Мягкий кардиган с пуговицами, для уютных вечеров.",
    price: 2990,
    category: "Кардиганы и свитеры",
    sizes: ["XS", "S", "M", "L"],
    colors: ["молочный", "горчичный", "зелёный"],
    images: ["https://example.com/img/cardigan.jpg"],
    stock: 20,
    rating: 4.7,
  },
  {
    product_id: "prod_009",
    name: "Джинсовые шорты",
    description: "Летние шорты из джинсовой ткани с потёртостями.",
    price: 1790,
    category: "Шорты",
    sizes: ["XS", "S", "M", "L"],
    colors: ["голубой", "белый"],
    images: ["https://example.com/img/denim_shorts.jpg"],
    stock: 45,
    rating: 4.3,
  },
  {
    product_id: "prod_010",
    name: "Пальто оверсайз",
    description: "Стильное пальто свободного кроя на осень-весну.",
    price: 9990,
    category: "Пальто",
    sizes: ["S", "M", "L"],
    colors: ["кэмел", "серый", "чёрный"],
    images: ["https://example.com/img/coat_oversize.jpg"],
    stock: 10,
    rating: 5.0,
  },
  {
    product_id: "prod_011",
    name: "Юбка-миди плиссе",
    description: "Элегантная юбка с мелкими складками до середины голени.",
    price: 2290,
    category: "Юбки",
    sizes: ["XS", "S", "M", "L"],
    colors: ["розовый", "лавандовый", "чёрный"],
    images: ["https://example.com/img/skirt_midi.jpg"],
    stock: 30,
    rating: 4.6,
  },
  {
    product_id: "prod_012",
    name: "Спортивный костюм",
    description: "Комплект: толстовка + брюки, мягкий трикотаж.",
    price: 4990,
    category: "Спортивная одежда",
    sizes: ["S", "M", "L", "XL"],
    colors: ["чёрный", "тёмно-синий", "бордовый"],
    images: ["https://example.com/img/tracksuit.jpg"],
    stock: 22,
    rating: 4.5,
  },
];

// ─── CARTS ────────────────────────────────────────────────────────────────────
const carts = [
  {
    cart_id: "cart_001",
    user_id: "user_001",
    items: [
      { product_id: "prod_001", size: "M", color: "белый", quantity: 2 },
      { product_id: "prod_002", size: "30", color: "синий", quantity: 1 },
    ],
  },
  {
    cart_id: "cart_002",
    user_id: "user_003",
    items: [
      { product_id: "prod_003", size: "S", color: "жёлтый", quantity: 1 },
      { product_id: "prod_011", size: "S", color: "розовый", quantity: 1 },
    ],
  },
  {
    cart_id: "cart_003",
    user_id: "user_004",
    items: [
      { product_id: "prod_007", size: "L", color: "чёрный", quantity: 1 },
      { product_id: "prod_006", size: "L", color: "белый", quantity: 2 },
    ],
  },
  {
    cart_id: "cart_004",
    user_id: "user_005",
    items: [
      { product_id: "prod_004", size: "M", color: "бежевый", quantity: 1 },
      { product_id: "prod_005", size: "M", color: "розовый", quantity: 2 },
    ],
  },
];

// ─── ORDERS ───────────────────────────────────────────────────────────────────
const orders = [
  {
    order_id: "order_001",
    user_id: "user_001",
    items: [
      { product_id: "prod_003", size: "S", color: "красный", quantity: 1, price: 2990 },
    ],
    total: 2990,
    status: "delivered",
  },
  {
    order_id: "order_002",
    user_id: "user_003",
    items: [
      { product_id: "prod_010", size: "M", color: "кэмел", quantity: 1, price: 9990 },
      { product_id: "prod_008", size: "S", color: "молочный", quantity: 1, price: 2990 },
    ],
    total: 12980,
    status: "processing",
  },
  {
    order_id: "order_003",
    user_id: "user_004",
    items: [
      { product_id: "prod_002", size: "32", color: "чёрный", quantity: 1, price: 3990 },
      { product_id: "prod_001", size: "L", color: "чёрный", quantity: 2, price: 2980 },
    ],
    total: 6970,
    status: "shipped",
  },
  {
    order_id: "order_004",
    user_id: "user_005",
    items: [
      { product_id: "prod_012", size: "M", color: "бордовый", quantity: 1, price: 4990 },
    ],
    total: 4990,
    status: "delivered",
  },
  {
    order_id: "order_005",
    user_id: "user_006",
    items: [
      { product_id: "prod_009", size: "M", color: "голубой", quantity: 1, price: 1790 },
      { product_id: "prod_005", size: "S", color: "чёрный", quantity: 1, price: 1990 },
    ],
    total: 3780,
    status: "delivered",
  },
  {
    order_id: "order_006",
    user_id: "user_001",
    items: [
      { product_id: "prod_004", size: "M", color: "серый меланж", quantity: 1, price: 3490 },
    ],
    total: 3490,
    status: "cancelled",
  },
];

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
const reviews = [
  {
    review_id: "review_001",
    product_id: "prod_001",
    user_id: "user_001",
    user_name: "Алиса Петрова",
    rating: 5,
    comment: "Отличная футболка, качество на высоте!",
  },
  {
    review_id: "review_002",
    product_id: "prod_002",
    user_id: "user_001",
    user_name: "Алиса Петрова",
    rating: 4,
    comment: "Хорошие джинсы, но немного маломерят.",
  },
  {
    review_id: "review_003",
    product_id: "prod_003",
    user_id: "user_003",
    user_name: "Мария Сидорова",
    rating: 5,
    comment: "Очень нежное платье, ткань приятная на ощупь. Беру ещё!",
  },
  {
    review_id: "review_004",
    product_id: "prod_010",
    user_id: "user_003",
    user_name: "Мария Сидорова",
    rating: 5,
    comment: "Пальто просто мечта! Сидит идеально, получила кучу комплиментов.",
  },
  {
    review_id: "review_005",
    product_id: "prod_007",
    user_id: "user_004",
    user_name: "Дмитрий Козлов",
    rating: 5,
    comment: "Куртка выглядит дорого, качество отличное. Советую!",
  },
  {
    review_id: "review_006",
    product_id: "prod_012",
    user_id: "user_005",
    user_name: "Екатерина Новикова",
    rating: 4,
    comment: "Костюм мягкий и тёплый, цвет точь-в-точь как на фото.",
  },
  {
    review_id: "review_007",
    product_id: "prod_009",
    user_id: "user_006",
    user_name: "Сергей Морозов",
    rating: 4,
    comment: "Шорты норм, но швы могли бы быть аккуратнее.",
  },
  {
    review_id: "review_008",
    product_id: "prod_005",
    user_id: "user_006",
    user_name: "Сергей Морозов",
    rating: 5,
    comment: "Заказал жене — она в восторге, не тянут и не катаются.",
  },
  {
    review_id: "review_009",
    product_id: "prod_004",
    user_id: "user_005",
    user_name: "Екатерина Новикова",
    rating: 5,
    comment: "Худи очень мягкое, цвет бежевый как на картинке. Размер взяла M — сидит отлично.",
  },
  {
    review_id: "review_010",
    product_id: "prod_008",
    user_id: "user_003",
    user_name: "Мария Сидорова",
    rating: 5,
    comment: "Кардиган нежнейший, горчичный цвет очень красивый вживую.",
  },
];

// ─── SEED FUNCTION ────────────────────────────────────────────────────────────
export async function seedFirestore() {
  try {
    console.log("⏳ Начало заполнения Firestore...");

    // Users
    for (const user of users) {
      await setDoc(doc(db, "users", user.user_id), {
        ...user,
        created_at: serverTimestamp(),
      });
    }
    console.log("✅ users — готово");

    // Products
    for (const product of products) {
      await setDoc(doc(db, "products", product.product_id), {
        ...product,
        created_at: serverTimestamp(),
      });
    }
    console.log("✅ products — готово");

    // Carts
    for (const cart of carts) {
      await setDoc(doc(db, "carts", cart.cart_id), {
        ...cart,
        updated_at: serverTimestamp(),
      });
    }
    console.log("✅ carts — готово");

    // Orders
    for (const order of orders) {
      await setDoc(doc(db, "orders", order.order_id), {
        ...order,
        created_at: serverTimestamp(),
      });
    }
    console.log("✅ orders — готово");

    // Reviews
    for (const review of reviews) {
      await setDoc(doc(db, "reviews", review.review_id), {
        ...review,
        created_at: serverTimestamp(),
      });
    }
    console.log("✅ reviews — готово");

    console.log("🎉 Firestore успешно заполнен!");
  } catch (error) {
    console.error("❌ Ошибка при заполнении Firestore:", error);
  }
}
