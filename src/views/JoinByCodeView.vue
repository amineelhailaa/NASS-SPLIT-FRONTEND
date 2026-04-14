<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/lib/axios'
import logoRaw from '@/assets/logo.svg?raw'

const route = useRoute()
const router = useRouter()
const code = route.params.code

const status = ref('preview') // 'preview' | 'joining' | 'success' | 'error'
const message = ref('')
const groupId = ref(null)
const groupName = ref('')

async function join() {
  status.value = 'joining'
  try {
    const res = await api.post(`/api/v1/groups/join/${code}`)
    const group = res.data.data
    groupId.value = group?.id
    groupName.value = group?.name ?? 'the group'
    status.value = 'success'
    setTimeout(() => router.push({ name: 'group-detail', params: { id: groupId.value } }), 1800)
  } catch (err) {
    message.value = err.response?.data?.message ?? 'This invite link is invalid or has expired.'
    status.value = 'error'
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-brand-background px-4"
    style="font-family: 'Plus Jakarta Sans', sans-serif"
  >
    <div class="w-full max-w-sm bg-white rounded-3xl shadow-[0_8px_40px_rgba(22,100,122,0.10)] px-8 py-10 flex flex-col items-center gap-6">

      <!-- Logo -->
      <div class="logo-inject w-10 h-10" v-html="logoRaw" />

      <!-- Preview: confirm before joining -->
      <template v-if="status === 'preview'">
        <div class="w-20 h-20 rounded-2xl bg-cerulean-100 flex items-center justify-center shadow-[0_4px_20px_rgba(22,100,122,0.10)]">
          <span class="material-symbols-outlined text-brand-primary text-[36px]">group_add</span>
        </div>

        <div class="flex flex-col items-center gap-1 text-center">
          <p class="text-brand-textSecondary text-sm">You've been invited via a shareable link</p>
          <h1 class="text-brand-text font-extrabold text-2xl">Join Group</h1>
        </div>

        <div class="flex flex-col gap-3 w-full">
          <button
            @click="join"
            class="w-full flex items-center justify-center gap-2 rounded-full py-4 text-base font-bold text-white transition-all active:scale-95"
            style="background-color: #41778b; box-shadow: 0 4px 20px rgba(22,100,122,0.15)"
          >
            <span class="material-symbols-outlined text-xl">check_circle</span>
            Accept & Join
          </button>
          <button
            @click="router.push({ name: 'groups' })"
            class="w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-cerulean-600 bg-cerulean-50 hover:bg-cerulean-100 transition-colors"
          >
            <span class="material-symbols-outlined text-lg">close</span>
            Cancel
          </button>
        </div>
      </template>

      <!-- Joining -->
      <div v-else-if="status === 'joining'" class="flex flex-col items-center gap-3 py-6">
        <div class="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
        <p class="text-brand-textSecondary text-sm">Joining group...</p>
      </div>

      <!-- Success -->
      <div v-else-if="status === 'success'" class="flex flex-col items-center gap-4 py-4 text-center">
        <div class="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
          <span class="material-symbols-outlined text-emerald-500 text-[32px]">check_circle</span>
        </div>
        <div class="flex flex-col gap-1">
          <p class="text-brand-text font-bold text-lg">You're in!</p>
          <p class="text-brand-textSecondary text-sm">
            Redirecting to <span class="font-semibold text-brand-primary">{{ groupName }}</span>...
          </p>
        </div>
      </div>

      <!-- Error -->
      <div v-else class="flex flex-col items-center gap-4 py-4 text-center">
        <div class="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <span class="material-symbols-outlined text-red-400 text-[32px]">error_outline</span>
        </div>
        <div class="flex flex-col gap-1">
          <p class="text-brand-text font-bold text-lg">Can't join</p>
          <p class="text-brand-textSecondary text-sm">{{ message }}</p>
        </div>
        <button
          @click="router.push({ name: 'groups' })"
          class="mt-2 w-full rounded-full py-3.5 text-sm font-bold text-white"
          style="background-color: #41778b"
        >
          Go to my groups
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.logo-inject :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
