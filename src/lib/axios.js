import axios from 'axios'
import { getActivePinia } from 'pinia'
import router from '@/router'
import echo from '@/lib/echo'
import { useAuthStore } from '@/stores/auth.js'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const socketId = echo.socketId()
  if (socketId) config.headers['X-Socket-ID'] = socketId
  return config
}) // for toOthers to work in the back end

function clearAuthState() {
  const pinia = getActivePinia()
  if (pinia) {
    useAuthStore(pinia).clearUser()
    return
  }
  localStorage.removeItem('user')
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      clearAuthState()

      if (!error.config?.skipAuthRedirect && router.currentRoute.value.name !== 'login') {
        router.replace({
          name: 'login',
          query: { redirect: router.currentRoute.value.fullPath },
        })
      }
    }

    if (status === 403) {
      const message = error.response?.data?.message ?? ''
      if (/ban/i.test(message) && router.currentRoute.value.name !== 'login') {
        clearAuthState()
        api.post('/logout').catch(() => {})
        router.replace({ name: 'login' })
      }
    }

    return Promise.reject(error)
  },
)

export default api
