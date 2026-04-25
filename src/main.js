import './assets/main.css'
import 'material-symbols/outlined.css'
import '@fontsource/plus-jakarta-sans/400.css'
import '@fontsource/plus-jakarta-sans/500.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'
import '@fontsource/plus-jakarta-sans/800.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'
import { useLocaleStore } from '@/stores/local'
import { i18n } from '@/i18n'
import PrimeVue from 'primevue/config'
import Chart from 'primevue/chart'
import {usePrimeVue} from "primevue";



const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const auth = useAuthStore(pinia)
await auth.restoreSession()

app.use(router)
app.use(i18n)
useLocaleStore(pinia)
app.use(PrimeVue)
app.component('Chart',Chart)
app.mount('#app')
