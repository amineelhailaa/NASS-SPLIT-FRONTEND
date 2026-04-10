import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/lib/axios.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!user.value)

  function setUser(data) {
    user.value = data
    if (data) localStorage.setItem('user', JSON.stringify(data))
    else localStorage.removeItem('user')
  }

  async function getCsrf() {
    await api.get('/sanctum/csrf-cookie')
  }

  // These throw on failure — the component catches and calls VeeValidate's setErrors()
  async function login(credentials) {
    await getCsrf()
    await api.post('/login', credentials)
    const { data } = await api.get('/api/user')
    setUser(data.data)
  }

  async function register(payload) {
    await getCsrf()
    await api.post('/register', payload)
    const { data } = await api.get('/api/user')
    setUser(data.data)
  }

  async function logout() {
    await api.post('/logout')
    setUser(null)
  }

  return { user, isAuthenticated, login, register, logout }
})