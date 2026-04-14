<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/axios'
import echo from '@/lib/echo'
import { useAuthStore } from '@/stores/auth.js'

const props = defineProps({
  variant: { type: String, default: 'sidebar' }, // 'sidebar' | 'navbar'
})

const router = useRouter()

const notifications = ref([])
const unreadCount = ref(0)
const loading = ref(false)
const open = ref(false)
const bellRef = ref(null)
const panelStyle = ref({})

async function fetchNotifications() {
  loading.value = true
  try {
    const res = await api.get('/api/v1/notifications')
    notifications.value = res.data.data.notifications.data ?? []
    unreadCount.value = res.data.data.unread_count ?? 0
  } catch {
    // silent
  } finally {
    loading.value = false
  }
}

async function handleNotifClick(notif) {
  if (!notif.read_at) {
    try {
      await api.patch(`/api/v1/notifications/${notif.id}/read`)
      notif.read_at = new Date().toISOString()
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch {
      // silent
    }
  }

  const link = notif.data?.link
  if (!link) return

  const groupId = link.split('/')[2]
  if (!groupId) return
  const tab = notif.type?.includes('Expense') ? 'expenses'
    : notif.type?.includes('Message') ? 'chat'
    : 'dashboard'

  open.value = false
  // Use replace + unique key to force re-render even if already on same group
  router.push({ name: 'group-detail', params: { id: groupId }, query: { tab } })
}

async function markAllRead() {
  try {
    await api.patch('/api/v1/notifications/read-all')
    notifications.value.forEach((n) => {
      if (!n.read_at) n.read_at = new Date().toISOString()
    })
    unreadCount.value = 0
  } catch {
    // silent
  }
}

function togglePanel() {
  if (!open.value) {
    const rect = bellRef.value.getBoundingClientRect()
    if (props.variant === 'navbar') {
      panelStyle.value = {
        top: rect.bottom + 8 + 'px',
        right: window.innerWidth - rect.right + 'px',
      }
    } else {
      panelStyle.value = {
        top: Math.min(rect.top, window.innerHeight - 420) + 'px',
        left: rect.right + 10 + 'px',
      }
    }
  }
  open.value = !open.value
}

function onOutsideClick(e) {
  if (open.value && bellRef.value && !bellRef.value.contains(e.target)) {
    open.value = false
  }
}

function notifIcon(type) {
  if (type?.includes('Expense')) return 'receipt'
  if (type?.includes('Message')) return 'chat'
  return 'notifications'
}

function notifIconBg(type) {
  if (type?.includes('Expense')) return 'bg-cerulean-50 text-brand-primary'
  if (type?.includes('Message')) return 'bg-emerald-50 text-emerald-600'
  return 'bg-brand-surface text-brand-textSecondary'
}

const auth = useAuthStore()
let echoChannel = null

onMounted(() => {
  fetchNotifications()
  document.addEventListener('click', onOutsideClick)

  if (auth.user?.id) {
    echoChannel = echo.private(`App.Models.User.${auth.user.id}`)
    echoChannel.notification((notif) => {
      // Broadcast sends payload flat; normalize to match API shape
      if (!notif.data) {
        const { id, type, ...rest } = notif
        notif = { id, type, data: rest, read_at: null, time_ago: 'just now' }
      }
      notifications.value.unshift(notif)
      unreadCount.value++
    })
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onOutsideClick)
  if (auth.user?.id) {
    echo.leave(`App.Models.User.${auth.user.id}`)
  }
})
</script>

<template>
  <!-- Sidebar variant -->
  <button
    v-if="variant === 'sidebar'"
    ref="bellRef"
    @click.stop="togglePanel"
    class="relative flex items-center gap-3 h-10 px-3 rounded-lg transition-colors w-full text-brand-textSecondary hover:bg-cerulean-50/50 hover:text-brand-primary"
    :class="open ? 'bg-cerulean-50 text-brand-primary' : ''"
  >
    <span class="material-symbols-outlined text-[20px] shrink-0">notifications</span>
    <span class="text-sm whitespace-nowrap overflow-hidden max-w-0 group-hover/sb:max-w-48 transition-[max-width] duration-200">
      Notifications
    </span>
    <span
      v-if="unreadCount > 0"
      class="absolute top-1.5 left-5 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5 leading-none"
    >
      {{ unreadCount > 99 ? '99+' : unreadCount }}
    </span>
  </button>

  <!-- Navbar variant -->
  <button
    v-else
    ref="bellRef"
    @click.stop="togglePanel"
    class="relative w-10 h-10 rounded-full flex items-center justify-center text-cerulean-700 hover:bg-cerulean-50 transition-colors cursor-pointer"
    :class="open ? 'bg-cerulean-50' : ''"
  >
    <span class="material-symbols-outlined text-[22px]">notifications</span>
    <span
      v-if="unreadCount > 0"
      class="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5 leading-none"
    >
      {{ unreadCount > 99 ? '99+' : unreadCount }}
    </span>
  </button>

  <!-- Panel (teleported so it escapes sidebar overflow-hidden) -->
  <Teleport to="body">
    <div
      v-if="open"
      :style="panelStyle"
      class="fixed z-[200] w-80 bg-white rounded-2xl shadow-[0_8px_32px_rgba(22,100,122,0.14)] flex flex-col overflow-hidden"
      style="max-height: 420px"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 bg-brand-surface/60">
        <div class="flex items-center gap-2">
          <span class="text-brand-text font-bold text-sm">Notifications</span>
          <span
            v-if="unreadCount > 0"
            class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-500"
          >
            {{ unreadCount }} new
          </span>
        </div>
        <button
          v-if="unreadCount > 0"
          @click="markAllRead"
          class="text-[11px] font-semibold text-brand-primary hover:text-brand-primaryHover transition-colors"
        >
          Mark all read
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-10">
        <div class="w-6 h-6 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
      </div>

      <!-- Empty -->
      <div v-else-if="!notifications.length" class="flex flex-col items-center justify-center py-10 gap-2">
        <span class="material-symbols-outlined text-[36px] text-brand-disabled">notifications_off</span>
        <p class="text-brand-textSecondary text-xs font-medium">No notifications yet</p>
      </div>

      <!-- List -->
      <div v-else class="overflow-y-auto flex flex-col">
        <button
          v-for="notif in notifications"
          :key="notif.id"
          @click="handleNotifClick(notif)"
          class="flex items-start gap-3 px-4 py-3 text-left transition-colors w-full"
          :class="notif.read_at ? 'hover:bg-brand-surface/50' : 'bg-cerulean-50/40 hover:bg-cerulean-50'"
        >
          <!-- Icon -->
          <div
            class="w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-0.5 overflow-hidden"
            :class="notifIconBg(notif.type)"
          >
            <img
              v-if="notif.data?.actor_avatar"
              :src="notif.data.actor_avatar"
              class="w-full h-full object-cover"
            />
            <span v-else class="material-symbols-outlined text-[15px]">{{ notifIcon(notif.type) }}</span>
          </div>

          <!-- Text -->
          <div class="flex-1 min-w-0">
            <p
              class="text-xs leading-snug"
              :class="notif.read_at ? 'text-brand-textSecondary' : 'text-brand-text font-semibold'"
            >
              {{ notif.data?.body }}
            </p>
            <p class="text-brand-disabled text-[10px] mt-0.5">{{ notif.time_ago }}</p>
          </div>

          <!-- Unread dot -->
          <div
            v-if="!notif.read_at"
            class="w-2 h-2 rounded-full bg-brand-primary shrink-0 mt-1.5"
          />
        </button>
      </div>
    </div>
  </Teleport>
</template>