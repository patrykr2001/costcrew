import './assets/main.css'
import '@clayui/css/lib/css/atlas.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useExpenseStore } from './stores/expenseStore'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Inicjalizacja store
const store = useExpenseStore()
store.initialize()

app.mount('#app')
