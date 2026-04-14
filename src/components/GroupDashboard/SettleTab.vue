<script setup>
import { ref } from 'vue'
import api from '@/lib/axios'
import { Vue3Lottie } from 'vue3-lottie'
import LoanAnimation from '@/assets/animation/Loan.json'

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
      creditor_id: owe.creditor_id,
      debtor_id: owe.debtor_id,
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
        class="bg-white rounded-2xl p-3 sm:p-5 shadow-[0_2px_12px_rgba(22,100,122,0.06)] flex flex-col gap-3"
      >
        <!-- Members row -->
        <div class="flex items-center gap-2 sm:gap-4">
          <!-- Debtor -->
          <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-50 shrink-0 overflow-hidden flex items-center justify-center">
              <img
                v-if="owe.debtor?.avatar?.url"
                :src="owe.debtor.avatar.url"
                :alt="owe.debtor.name"
                class="w-full h-full object-cover"
              />
              <span v-else class="material-symbols-outlined text-red-400 text-[16px] sm:text-[18px]">person</span>
            </div>
            <span class="text-brand-text font-semibold text-xs sm:text-sm truncate">{{ owe.debtor?.name }}</span>
          </div>

          <!-- Lottie animation + amount -->
          <div class="flex flex-col items-center gap-0.5 shrink-0 w-10 sm:w-14">
            <Vue3Lottie
              :animation-data="LoanAnimation"
              :loop="true"
              :auto-play="true"
              :width="40"
              :height="40"
            />
            <span class="text-cerulean-700 font-extrabold text-[10px] sm:text-xs leading-none">{{ formatCurrency(owe.amount) }}</span>
          </div>

          <!-- Creditor -->
          <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-end">
            <span class="text-brand-text font-semibold text-xs sm:text-sm truncate">{{ owe.creditor?.name }}</span>
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-50 shrink-0 overflow-hidden flex items-center justify-center">
              <img
                v-if="owe.creditor?.avatar?.url"
                :src="owe.creditor.avatar.url"
                :alt="owe.creditor.name"
                class="w-full h-full object-cover"
              />
              <span v-else class="material-symbols-outlined text-emerald-500 text-[16px] sm:text-[18px]">person</span>
            </div>
          </div>
        </div>

        <!-- Settle button -->
        <button
          @click="settleDebt(owe)"
          :disabled="settling === owe"
          class="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="settling === owe ? 'bg-brand-surface text-brand-disabled' : 'bg-cerulean-50 text-brand-primary hover:bg-cerulean-100'"
        >
          <span
            v-if="settling === owe"
            class="material-symbols-outlined text-[16px] animate-spin"
          >progress_activity</span>
          <span v-else class="material-symbols-outlined text-[16px]">handshake</span>
          {{ settling === owe ? 'Recording…' : 'Mark as Settled' }}
        </button>
      </div>
    </div>
  </div>
</template>
