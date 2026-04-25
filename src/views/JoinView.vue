<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '@/lib/axios'
import logoRaw from '@/assets/logo.svg?raw'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const token = route.params.token

const invitation = ref(null)
const loading = ref(true)
const error = ref(null)
const acting = ref(null) // 'accept' | 'decline'
const done = ref(null)   // 'accepted' | 'declined'

onMounted(async () => {
  try {
    const res = await api.get(`/api/v1/invitations/${token}`)
    invitation.value = res.data.data
  } catch (err) {
    error.value = err.response?.data?.message ?? t('join.errors.invalid')
  } finally {
    loading.value = false
  }
})

async function accept() {
  acting.value = 'accept'
  try {
    const res = await api.post(`/api/v1/invitations/${token}/accept`)
    done.value = 'accepted'
    const groupId = res.data.data?.id ?? invitation.value?.group?.id
    setTimeout(() => router.push({ name: 'group-detail', params: { id: groupId } }), 1800)
  } catch (err) {
    error.value = err.response?.data?.message ?? t('join.errors.acceptFailed')
  } finally {
    acting.value = null
  }
}

async function decline() {
  acting.value = 'decline'
  try {
    await api.post(`/api/v1/invitations/${token}/decline`)
    done.value = 'declined'
    setTimeout(() => router.push({ name: 'groups' }), 1800)
  } catch (err) {
    error.value = err.response?.data?.message ?? t('join.errors.declineFailed')
  } finally {
    acting.value = null
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

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center gap-3 py-6">
        <div class="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
        <p class="text-brand-textSecondary text-sm">{{ t('join.loading') }}</p>
      </div>

      <!-- Error -->
      <div v-else-if="error && !done" class="flex flex-col items-center gap-4 py-4 text-center">
        <div class="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <span class="material-symbols-outlined text-red-400 text-[32px]">error_outline</span>
        </div>
        <div class="flex flex-col gap-1">
          <p class="text-brand-text font-bold text-lg">{{ t('join.errorTitle') }}</p>
          <p class="text-brand-textSecondary text-sm">{{ error }}</p>
        </div>
        <button
          @click="router.push({ name: 'groups' })"
          class="mt-2 w-full rounded-full py-3.5 text-sm font-bold text-white"
          style="background-color: #41778b"
        >
          {{ t('join.goToGroups') }}
        </button>
      </div>

      <!-- Done: accepted -->
      <div v-else-if="done === 'accepted'" class="flex flex-col items-center gap-4 py-4 text-center">
        <div class="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
          <span class="material-symbols-outlined text-emerald-500 text-[32px]">check_circle</span>
        </div>
        <div class="flex flex-col gap-1">
          <p class="text-brand-text font-bold text-lg">{{ t('join.accepted.title') }}</p>
          <p class="text-brand-textSecondary text-sm">{{ t('join.accepted.redirecting', { groupName: invitation?.group?.name }) }}</p>
        </div>
      </div>

      <!-- Done: declined -->
      <div v-else-if="done === 'declined'" class="flex flex-col items-center gap-4 py-4 text-center">
        <div class="w-16 h-16 rounded-2xl bg-cerulean-50 flex items-center justify-center">
          <span class="material-symbols-outlined text-brand-textSecondary text-[32px]">do_not_disturb</span>
        </div>
        <div class="flex flex-col gap-1">
          <p class="text-brand-text font-bold text-lg">{{ t('join.declined.title') }}</p>
          <p class="text-brand-textSecondary text-sm">{{ t('join.declined.redirecting') }}</p>
        </div>
      </div>

      <!-- Invitation card -->
      <template v-else-if="invitation">
        <!-- Group avatar -->
        <div class="w-20 h-20 rounded-2xl bg-cerulean-100 overflow-hidden flex items-center justify-center shadow-[0_4px_20px_rgba(22,100,122,0.10)]">
          <img
            v-if="invitation.group?.avatar?.url"
            :src="invitation.group.avatar.url"
            :alt="invitation.group?.name"
            class="w-full h-full object-cover"
          />
          <span v-else class="material-symbols-outlined text-brand-primary text-[36px]">group</span>
        </div>

        <!-- Text -->
        <div class="flex flex-col items-center gap-1 text-center">
          <p class="text-brand-textSecondary text-sm">{{ t('join.invited') }}</p>
          <h1 class="text-brand-text font-extrabold text-2xl">{{ invitation.group?.name }}</h1>
          <p v-if="invitation.group?.description" class="text-brand-textSecondary text-sm mt-1 line-clamp-2">
            {{ invitation.group.description }}
          </p>
        </div>

        <!-- Expiry -->
        <div class="flex items-center gap-2 bg-cerulean-50 rounded-xl px-4 py-2.5 w-full justify-center">
          <span class="material-symbols-outlined text-cerulean-500 text-[16px]">schedule</span>
          <span class="text-xs font-semibold text-cerulean-700">
            {{ t('join.expires', { date: new Date(invitation.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }) }}
          </span>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-3 w-full">
          <button
            @click="accept"
            :disabled="!!acting"
            class="w-full flex items-center justify-center gap-2 rounded-full py-4 text-base font-bold text-white transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            style="background-color: #41778b; box-shadow: 0 4px 20px rgba(22,100,122,0.15)"
          >
            <span v-if="acting === 'accept'" class="material-symbols-outlined text-xl animate-spin">progress_activity</span>
            <template v-else>
              <span class="material-symbols-outlined text-xl">check_circle</span>
              {{ t('join.accept') }}
            </template>
          </button>

          <button
            @click="decline"
            :disabled="!!acting"
            class="w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-cerulean-600 bg-cerulean-50 hover:bg-cerulean-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span v-if="acting === 'decline'" class="material-symbols-outlined text-lg animate-spin">progress_activity</span>
            <template v-else>
              <span class="material-symbols-outlined text-lg">close</span>
              {{ t('join.decline') }}
            </template>
          </button>
        </div>
      </template>

    </div>
  </div>
</template>

<style scoped>
.logo-inject :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>