import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import './firebase'
import { seedFirestore } from './seedFirestore'

// Заполнить Firestore начальными данными (запустить один раз, затем убрать)
seedFirestore()

createApp(App).mount('#app')
