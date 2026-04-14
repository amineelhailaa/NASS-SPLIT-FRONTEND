<script setup>
import { ref, onMounted } from 'vue'
import api from '@/lib/axios'
import Swal from 'sweetalert2'

const props = defineProps({
  groupId: [Number, String],
  group: Object,
  isOwner: Boolean,
})

const emit = defineEmits(['ownership-transferred'])

const members = ref([])
const loading = ref(true)
const currentPage = ref(1)
const lastPage = ref(1)
const kicking = ref(null)
const transferring = ref(null)

async function fetchMembers(page = 1) {
  loading.value = true
  try {
    const res = await api.get(`/api/v1/groups/${props.groupId}/members`, { params: { page } })
    members.value = res.data.data.data
    currentPage.value = res.data.data.current_page
    lastPage.value = res.data.data.last_page
  } catch {
    members.value = []
  } finally {
    loading.value = false
  }
}

async function kickMember(member) {
  const { isConfirmed } = await Swal.fire({
    title: `Kick ${member.user?.name}?`,
    text: 'This member will be removed from the group.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Kick',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#e5e7eb',
  })
  if (!isConfirmed) return

  kicking.value = member.id
  try {
    await api.patch(`/api/v1/groups/${props.groupId}/members/${member.id}/kick`)
    members.value = members.value.filter((m) => m.id !== member.id)
  } catch (err) {
    Swal.fire({
      title: 'Cannot kick member',
      text: err.response?.data?.message ?? 'Something went wrong.',
      icon: 'error',
      confirmButtonColor: '#16647a',
    })
  } finally {
    kicking.value = null
  }
}

async function transferOwnership(member) {
  const { isConfirmed } = await Swal.fire({
    title: 'Transfer Ownership?',
    html: `<p class="text-sm text-gray-500">You are about to make <strong>${member.user?.name}</strong> the new owner.<br/>You will become a regular member and lose owner privileges.</p>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, transfer',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#16647a',
    cancelButtonColor: '#e5e7eb',
  })
  if (!isConfirmed) return

  transferring.value = member.id
  try {
    await api.patch(`/api/v1/groups/${props.groupId}/transfer-ownership`, {
      membership_id: member.id,
    })
    await fetchMembers(currentPage.value)
    emit('ownership-transferred')
  } catch (err) {
    Swal.fire({
      title: 'Transfer failed',
      text: err.response?.data?.message ?? 'Something went wrong.',
      icon: 'error',
      confirmButtonColor: '#16647a',
    })
  } finally {
    transferring.value = null
  }
}

onMounted(() => fetchMembers())
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h2 class="text-brand-text font-bold text-xl">Members</h2>
      <span class="text-brand-textSecondary text-sm font-medium">{{ members.length }} member{{ members.length !== 1 ? 's' : '' }}</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col gap-3">
      <div v-for="n in 4" :key="n" class="animate-pulse bg-brand-surface rounded-2xl h-16" />
    </div>

    <!-- Empty -->
    <div v-else-if="!members.length" class="flex flex-col items-center justify-center py-24 gap-4">
      <span class="material-symbols-outlined text-[56px] text-brand-disabled">group</span>
      <p class="text-brand-textSecondary font-semibold text-lg">No members found</p>
    </div>

    <!-- List -->
    <div v-else class="flex flex-col gap-3">
      <div
        v-for="member in members"
        :key="member.id"
        class="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(22,100,122,0.06)] flex items-center gap-4"
      >
        <!-- Avatar -->
        <div class="w-12 h-12 rounded-full bg-cerulean-50 shrink-0 overflow-hidden flex items-center justify-center">
          <img
            v-if="member.user?.avatar?.url"
            :src="member.user.avatar.url"
            :alt="member.user?.name"
            class="w-full h-full object-cover"
          />
          <span v-else class="material-symbols-outlined text-brand-primary text-[22px]">person</span>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-brand-text font-semibold text-sm truncate">{{ member.user?.name }}</p>
          <p class="text-brand-textSecondary text-xs">{{ member.user?.email }}</p>
        </div>

        <!-- Role badge -->
        <span
          class="text-xs font-semibold px-3 py-1 rounded-full shrink-0"
          :class="member.role === 'owner' ? 'bg-cerulean-50 text-brand-primary' : 'bg-brand-surface text-brand-textSecondary'"
        >
          {{ member.role }}
        </span>

        <!-- Owner actions (owner only, not for other owners) -->
        <div v-if="isOwner && member.role !== 'owner'" class="flex items-center gap-1 shrink-0">
          <!-- Transfer ownership -->
          <button
            @click="transferOwnership(member)"
            :disabled="transferring === member.id || kicking === member.id"
            class="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-cerulean-50 disabled:opacity-40 disabled:cursor-not-allowed text-brand-primary hover:text-brand-primaryHover"
            title="Transfer ownership"
          >
            <span
              v-if="transferring === member.id"
              class="material-symbols-outlined text-[18px] animate-spin"
            >progress_activity</span>
            <span v-else class="material-symbols-outlined text-[18px]">workspace_premium</span>
          </button>

          <!-- Kick -->
          <button
            @click="kickMember(member)"
            :disabled="kicking === member.id || transferring === member.id"
            class="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
            :class="kicking === member.id ? 'text-brand-disabled' : 'text-red-400 hover:text-red-500'"
            title="Remove member"
          >
            <span
              v-if="kicking === member.id"
              class="material-symbols-outlined text-[18px] animate-spin"
            >progress_activity</span>
            <span v-else class="material-symbols-outlined text-[18px]">person_remove</span>
          </button>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="lastPage > 1" class="flex items-center justify-center gap-2 pt-4">
        <button
          @click="fetchMembers(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
          :class="currentPage <= 1 ? 'text-brand-disabled bg-brand-surface' : 'text-brand-primary bg-cerulean-50 hover:bg-cerulean-100'"
        >
          Previous
        </button>
        <span class="text-brand-textSecondary text-sm font-medium px-3">
          {{ currentPage }} / {{ lastPage }}
        </span>
        <button
          @click="fetchMembers(currentPage + 1)"
          :disabled="currentPage >= lastPage"
          class="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
          :class="currentPage >= lastPage ? 'text-brand-disabled bg-brand-surface' : 'text-brand-primary bg-cerulean-50 hover:bg-cerulean-100'"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
