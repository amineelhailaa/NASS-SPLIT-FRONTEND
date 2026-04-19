import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'
import PrimeVue from 'primevue/config'
import Chart from 'primevue/chart'
import {usePrimeVue} from "primevue";

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const auth = useAuthStore(pinia)
await auth.restoreSession()

app.use(router)
app.use(PrimeVue)
app.component('Chart',Chart)
app.mount('#app')
