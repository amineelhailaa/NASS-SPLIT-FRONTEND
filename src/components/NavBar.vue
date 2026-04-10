<script setup>
import logoRaw from '@/assets/logo.svg?raw'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <header class="fixed top-0 z-50 w-full px-6 py-4">
    <nav
      class="mx-auto flex items-center justify-between rounded-full bg-white/80 pr-6 pl-2 shadow-sm backdrop-blur-md border border-white/20"
    >
      <div  class="flex justify-center items-center gap-2">
        <div class="w-16 h-16 overflow-hidden shrink-0" v-html="logoRaw" />
        <span class=" text-2xl font-bold opacity-80">NASS SPLIT</span>
      </div>

      <div class="hidden md:flex items-center gap-8">
        <router-link to="/" class="text-sm font-extrabold text-cerulean-600 transition-colors">Home</router-link>
        <router-link
          v-if="auth.isAuthenticated"
          to="/groups"
          class="text-sm font-semibold text-cerulean-800 hover:text-cerulean-600 transition-colors"
        >Groups</router-link>
        <router-link
          to="/contact"
          class="text-sm font-semibold text-cerulean-800 hover:text-cerulean-600 transition-colors"
          >Contact Us</router-link
        >
        <router-link
          to="/faq"
          class="text-sm font-semibold text-cerulean-800 hover:text-cerulean-600 transition-colors"
          >FAQ</router-link
        >
      </div>

      <button
        class="rounded-full bg-cerulean-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-cerulean-700 transition-all cursor-pointer"
      >
        Get Started
      </button>
    </nav>
  </header>
</template>

<style scoped>
div :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
