import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/lib/axios.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  async function getCsrf() {
    await api.get('/sanctum/csrf-cookie')
  }

  async function fetchUser() {
    try {
      const { data } = await api.get('/api/user')
      user.value = data
    } catch {
      user.value = null
    }
  }

  // These throw on failure — the component catches and calls VeeValidate's setErrors()
  async function login(credentials) {
    await getCsrf()
    await api.post('/login', credentials)
    await fetchUser()
  }

  async function register(payload) {
    await getCsrf()
    await api.post('/register', payload)
    await fetchUser()
  }

  async function logout() {
    await api.post('/logout')
    user.value = null
  }

  return { user, isAuthenticated, login, register, logout, fetchUser }
})