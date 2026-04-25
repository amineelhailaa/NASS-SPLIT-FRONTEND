<script setup>
import { ref, onMounted } from 'vue'
import { useClipboard } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import Swal from 'sweetalert2'
import api from '@/lib/axios'

const { copy, copied: linkCopied } = useClipboard({ legacy: true })
const { t } = useI18n()

const props = defineProps({
  groupId: [Number, String],
})

const invitations = ref([])
const loading = ref(true)
const loadError = ref(false)
const emailInput = ref('')
const emailError = ref('')
const sending = ref(false)
const sendSuccess = ref(false)
const inviteLink = ref('')
const cancellingId = ref(null)

async function fetchInvitations() {
  loading.value = true
  loadError.value = false
  try {
    const res = await api.get(`/api/v1/groups/${props.groupId}/invitations/pending`)
    invitations.value = res.data.data ?? []
  } catch {
    invitations.value = []
    loadError.value = true
  } finally {
    loading.value = false
  }
}

async function fetchInviteLink() {
  try {
    const res = await api.get(`/api/v1/groups/${props.groupId}/invitation-code`)
    const code = res.data.data?.invitation_code ?? res.data.invitation_code
    if (code) inviteLink.value = `${window.location.origin}/groups/join/${code}`
  } catch {
    // non-critical
  }
}

async function sendInvite() {
  emailError.value = ''
  sendSuccess.value = false
  const val = emailInput.value.trim()
  if (!val) { emailError.value = t('invitations.errors.emailRequired'); return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { emailError.value = t('invitations.errors.emailInvalid'); return }

  sending.value = true
  try {
    await api.post(`/api/v1/groups/${props.groupId}/invite`, { email: val })
    emailInput.value = ''
    sendSuccess.value = true
    setTimeout(() => (sendSuccess.value = false), 3000)
    await fetchInvitations()
  } catch (err) {
    emailError.value = err.response?.data?.message ?? t('invitations.errors.sendFailed')
  } finally {
    sending.value = false
  }
}

async function cancelInvitation(invitation) {
  const result = await Swal.fire({
    title: t('invitations.dialogs.cancel.title'),
    text: t('invitations.dialogs.cancel.text', { email: invitation.email }),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: t('invitations.dialogs.cancel.confirm'),
    cancelButtonText: t('invitations.dialogs.cancel.keep'),
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#41778b',
  })
  if (!result.isConfirmed) return

  cancellingId.value = invitation.id
  try {
    await api.patch(`/api/v1/groups/${props.groupId}/invitations/${invitation.id}/cancel`)
    invitations.value = invitations.value.filter((i) => i.id !== invitation.id)
  } finally {
    cancellingId.value = null
  }
}

async function copyLink() {
  if (inviteLink.value) await copy(inviteLink.value)
}

function formatExpiry(dateStr) {
  const d = new Date(dateStr)
  const diff = Math.ceil((d - Date.now()) / 86400000)
  if (diff <= 0) return t('invitations.expired')
  if (diff === 1) return t('invitations.expiresTomorrow')
  return t('invitations.expiresIn', { diff })
}

onMounted(() => {
  Promise.all([fetchInvitations(), fetchInviteLink()])
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <h2 class="text-brand-text font-bold text-xl">{{ t('invitations.title') }}</h2>

    <!-- Invite by email -->
    <div class="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(22,100,122,0.06)] flex flex-col gap-4">
      <p class="text-sm font-bold text-cerulean-800">{{ t('invitations.inviteByEmail') }}</p>

      <div class="flex gap-2">
        <div class="flex-1 relative">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none">mail</span>
          <input
            v-model="emailInput"
            type="email"
            :placeholder="t('invitations.emailPlaceholder')"
            @keydown.enter.prevent="sendInvite"
            class="w-full bg-cerulean-100 text-cerulean-800 placeholder:text-cerulean-800/30 rounded-full pl-11 pr-5 py-3.5 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition text-sm"
            :class="{ 'ring-2 ring-red-400/50 bg-red-50': emailError }"
          />
        </div>
        <button
          type="button"
          @click="sendInvite"
          :disabled="sending"
          class="shrink-0 h-12 px-5 rounded-full bg-brand-primary text-white text-sm font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span v-if="sending" class="material-symbols-outlined text-lg animate-spin">progress_activity</span>
          <template v-else>
            <span class="material-symbols-outlined text-lg">send</span>
            {{ t('invitations.send') }}
          </template>
        </button>
      </div>

      <!-- Feedback -->
      <p v-if="emailError" class="text-xs font-semibold text-red-500 flex items-center gap-1">
        <span class="material-symbols-outlined text-[14px]">error</span>
        {{ emailError }}
      </p>
      <p v-if="sendSuccess" class="text-xs font-semibold text-brand-primary flex items-center gap-1">
        <span class="material-symbols-outlined text-[14px]">check_circle</span>
        {{ t('invitations.success') }}
      </p>

      <!-- Copy invite link -->
      <button
        type="button"
        @click="copyLink"
        :disabled="!inviteLink"
        class="flex items-center gap-3 rounded-xl px-4 py-3 bg-cerulean-50 hover:bg-cerulean-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span class="material-symbols-outlined text-cerulean-500 text-[20px]">link</span>
        <span class="text-sm font-semibold text-cerulean-700 flex-1 text-left">
          {{ linkCopied ? t('invitations.linkCopied') : t('invitations.copyLink') }}
        </span>
        <span v-if="linkCopied" class="material-symbols-outlined text-brand-primary text-[18px]">check</span>
        <span v-else class="material-symbols-outlined text-cerulean-400 text-[18px]">content_copy</span>
      </button>
    </div>

    <!-- Pending invitations -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <p class="text-sm font-bold text-cerulean-800">{{ t('invitations.pending') }}</p>
        <span class="text-xs font-semibold text-brand-textSecondary">{{ t('invitations.pendingCount', { count: invitations.length }) }}</span>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col gap-2">
        <div v-for="n in 3" :key="n" class="animate-pulse bg-brand-surface rounded-2xl h-16" />
      </div>

      <!-- Error -->
      <div v-else-if="loadError" class="flex flex-col items-center justify-center py-16 gap-3">
        <span class="material-symbols-outlined text-[48px] text-red-400">error</span>
        <p class="text-red-500 font-semibold text-sm">{{ t('invitations.loadFailed') }}</p>
        <button
          type="button"
          @click="fetchInvitations"
          class="text-brand-primary text-xs font-bold hover:underline"
        >{{ t('invitations.tryAgain') }}</button>
      </div>

      <!-- Empty -->
      <div v-else-if="!invitations.length" class="flex flex-col items-center justify-center py-16 gap-3">
        <span class="material-symbols-outlined text-[48px] text-brand-disabled">mark_email_unread</span>
        <p class="text-brand-textSecondary font-semibold text-sm">{{ t('invitations.empty') }}</p>
      </div>

      <!-- List -->
      <div v-else class="flex flex-col gap-2">
        <div
          v-for="inv in invitations"
          :key="inv.id"
          class="bg-white rounded-2xl px-5 py-4 shadow-[0_2px_12px_rgba(22,100,122,0.06)] flex items-center gap-4"
        >
          <!-- Icon -->
          <div class="w-10 h-10 rounded-full bg-cerulean-50 flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-brand-primary text-[20px]">person_add</span>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="text-brand-text font-semibold text-sm truncate">{{ inv.email }}</p>
            <p class="text-brand-textSecondary text-xs">{{ formatExpiry(inv.expires_at) }}</p>
          </div>

          <!-- Status badge -->
          <span class="text-xs font-semibold px-3 py-1 rounded-full border-2 border-brand-primary text-brand-primary shrink-0">
            {{ t('invitations.pendingLabel') }}
          </span>

          <!-- Cancel -->
          <button
            type="button"
            @click="cancelInvitation(inv)"
            :disabled="cancellingId === inv.id"
            class="w-9 h-9 rounded-full flex items-center justify-center text-brand-textSecondary hover:bg-red-50 hover:text-red-500 transition-colors shrink-0 disabled:opacity-40"
          >
            <span v-if="cancellingId === inv.id" class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
            <span v-else class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
