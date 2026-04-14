<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import logoRaw from '@/assets/logo.svg?raw'
import { useAuthStore } from '@/stores/auth'
import NotificationBell from '@/components/NotificationBell.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const dropdownOpen = ref(false)
const dropdownRef = ref(null)

function userInitials(name) {
  return name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function handleClickOutside(e) {
  if (dropdownOpen.value && dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

async function handleLogout() {
  dropdownOpen.value = false
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="fixed top-0 z-50 w-full px-6 py-4">
    <nav
      class="mx-auto flex items-center justify-between rounded-full bg-white/80 pr-4 pl-2 shadow-sm backdrop-blur-md border border-white/20"
    >
      <!-- Logo -->
      <div class="flex justify-center items-center gap-2">
        <div class="w-16 h-16 overflow-hidden shrink-0" v-html="logoRaw" />
        <span class="text-2xl font-bold opacity-80">NASS SPLIT</span>
      </div>

      <!-- Nav links -->
      <div class="hidden md:flex items-center gap-2">
        <router-link
          to="/"
          class="text-sm font-semibold px-4 py-2 rounded-full transition-colors"
          :class="route.name === 'home' ? 'bg-cerulean-600 text-white font-bold' : 'text-cerulean-800 hover:text-cerulean-600'"
        >Home</router-link>
        <router-link
          v-if="auth.isAuthenticated"
          to="/groups"
          class="text-sm font-semibold px-4 py-2 rounded-full transition-colors"
          :class="(route.name === 'groups' || route.name === 'group-detail') ? 'bg-cerulean-600 text-white font-bold' : 'text-cerulean-800 hover:text-cerulean-600'"
        >Groups</router-link>
        <router-link
          to="/contact"
          class="text-sm font-semibold px-4 py-2 rounded-full transition-colors"
          :class="route.name === 'contact' ? 'bg-cerulean-600 text-white font-bold' : 'text-cerulean-800 hover:text-cerulean-600'"
        >Contact Us</router-link>
        <router-link
          to="/faq"
          class="text-sm font-semibold px-4 py-2 rounded-full transition-colors"
          :class="route.name === 'faq' ? 'bg-cerulean-600 text-white font-bold' : 'text-cerulean-800 hover:text-cerulean-600'"
        >FAQ</router-link>
      </div>

      <!-- Right side — guest -->
      <button
        v-if="!auth.isAuthenticated"
        @click="router.push('/signup')"
        class="rounded-full bg-cerulean-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-cerulean-700 transition-all cursor-pointer"
      >
        Get Started
      </button>

      <!-- Right side — authenticated -->
      <div v-else class="flex items-center gap-2">
        <!-- Notification bell -->
        <NotificationBell variant="navbar" />

        <!-- Avatar + dropdown -->
        <div class="relative" ref="dropdownRef">
          <button
            @click.stop="dropdownOpen = !dropdownOpen"
            class="w-10 h-10 rounded-full overflow-hidden bg-cerulean-100 flex items-center justify-center cursor-pointer ring-2 ring-transparent hover:ring-cerulean-300 transition-all"
          >
            <img
              v-if="auth.user?.avatar?.url"
              :src="auth.user.avatar.url"
              :alt="auth.user.name"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-cerulean-700 text-sm font-bold select-none">
              {{ userInitials(auth.user?.name) }}
            </span>
          </button>

          <!-- Dropdown menu -->
          <div
            v-show="dropdownOpen"
            class="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_8px_32px_rgba(22,100,122,0.12)] py-2 z-50"
          >
            <!-- User info -->
            <div class="px-4 py-3">
              <p class="text-brand-text text-sm font-bold truncate">{{ auth.user?.name }}</p>
              <p class="text-brand-textSecondary text-xs truncate pt-0.5">{{ auth.user?.email }}</p>
            </div>

            <div class="h-px bg-brand-surface mx-2" />

            <button
              @click="() => { dropdownOpen = false; router.push('/profile') }"
              class="w-full text-left px-4 py-2.5 text-sm font-medium text-brand-text hover:bg-brand-surface transition-colors flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px] text-brand-textSecondary">person</span>
              Edit Profile
            </button>

            <button
              @click="dropdownOpen = false"
              class="w-full text-left px-4 py-2.5 text-sm font-medium text-brand-text hover:bg-brand-surface transition-colors flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px] text-brand-textSecondary">tune</span>
              Preferences
            </button>

            <div class="h-px bg-brand-surface mx-2 my-1" />

            <button
              @click="handleLogout"
              class="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">logout</span>
              Log Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>
div :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
