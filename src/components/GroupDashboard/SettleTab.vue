<script setup>
import { ref } from 'vue'
import api from '@/lib/axios'

const props = defineProps({
  owes: { type: Array, default: () => [] },
  group: Object,
  groupId: [Number, String],
})

const settling = ref(null)
const settleError = ref(null)
const settleSuccess = ref(null)

async function settleDebt(owe) {
  settling.value = owe
  settleError.value = null
  settleSuccess.value = null
  try {
    await api.post('/api/v1/payments', {
      creditor_id: owe.creditor_membership_id,
      debtor_id: owe.debtor_membership_id,
      amount: owe.amount,
    })
    settleSuccess.value = `Payment of $${Number(owe.amount).toFixed(2)} recorded`
  } catch {
    settleError.value = 'Failed to record payment'
  } finally {
    settling.value = null
  }
}

function formatCurrency(val) {
  return `$${Number(val).toFixed(2)}`
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h2 class="text-brand-text font-bold text-xl">Who Owes Who</h2>
      <span class="text-brand-textSecondary text-sm font-medium">{{ owes.length }} settlement{{ owes.length !== 1 ? 's' : '' }}</span>
    </div>

    <!-- Success / Error banners -->
    <div v-if="settleSuccess" class="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
      <span class="material-symbols-outlined text-[18px]">check_circle</span>
      {{ settleSuccess }}
    </div>
    <div v-if="settleError" class="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
      <span class="material-symbols-outlined text-[18px]">error</span>
      {{ settleError }}
    </div>

    <!-- Empty state -->
    <div v-if="!owes.length" class="flex flex-col items-center justify-center py-24 gap-4">
      <span class="material-symbols-outlined text-[56px] text-brand-disabled">handshake</span>
      <p class="text-brand-textSecondary font-semibold text-lg">All settled up!</p>
      <p class="text-brand-textSecondary text-sm">No outstanding debts in this group</p>
    </div>

    <!-- Owes list -->
    <div v-else class="flex flex-col gap-3">
      <div
        v-for="(owe, idx) in owes"
        :key="idx"
        class="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(22,100,122,0.06)] flex items-center gap-4"
      >
        <!-- Debtor -->
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="w-10 h-10 rounded-full bg-red-50 shrink-0 overflow-hidden flex items-center justify-center">
            <img
              v-if="owe.debtor?.avatar?.url"
              :src="owe.debtor.avatar.url"
              :alt="owe.debtor.name"
              class="w-full h-full object-cover"
            />
            <span v-else class="material-symbols-outlined text-red-400 text-[18px]">person</span>
          </div>
          <span class="text-brand-text font-semibold text-sm truncate">{{ owe.debtor?.name }}</span>
        </div>

        <!-- Arrow + amount -->
        <div class="flex items-center gap-2 shrink-0">
          <span class="material-symbols-outlined text-brand-textSecondary text-[18px]">arrow_forward</span>
          <span class="text-cerulean-700 font-extrabold text-base">{{ formatCurrency(owe.amount) }}</span>
          <span class="material-symbols-outlined text-brand-textSecondary text-[18px]">arrow_forward</span>
        </div>

        <!-- Creditor -->
        <div class="flex items-center gap-3 flex-1 min-w-0 justify-end">
          <span class="text-brand-text font-semibold text-sm truncate">{{ owe.creditor?.name }}</span>
          <div class="w-10 h-10 rounded-full bg-emerald-50 shrink-0 overflow-hidden flex items-center justify-center">
            <img
              v-if="owe.creditor?.avatar?.url"
              :src="owe.creditor.avatar.url"
              :alt="owe.creditor.name"
              class="w-full h-full object-cover"
            />
            <span v-else class="material-symbols-outlined text-emerald-500 text-[18px]">person</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
