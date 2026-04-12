<script setup>
import { ref, onMounted } from 'vue'
import api from '@/lib/axios'

const props = defineProps({
  groupId: [Number, String],
  group: Object,
})

const payments = ref([])
const loading = ref(true)
const currentPage = ref(1)
const lastPage = ref(1)

async function fetchPayments(page = 1) {
  loading.value = true
  try {
    const res = await api.get('/api/v1/payments', { params: { page } })
    payments.value = res.data.data.data
    currentPage.value = res.data.data.current_page
    lastPage.value = res.data.data.last_page
  } catch {
    payments.value = []
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCurrency(val) {
  return `$${Number(val).toFixed(2)}`
}

onMounted(() => fetchPayments())
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h2 class="text-brand-text font-bold text-xl">My Payments</h2>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col gap-3">
      <div v-for="n in 4" :key="n" class="animate-pulse bg-brand-surface rounded-2xl h-20" />
    </div>

    <!-- Empty -->
    <div v-else-if="!payments.length" class="flex flex-col items-center justify-center py-24 gap-4">
      <span class="material-symbols-outlined text-[56px] text-brand-disabled">payments</span>
      <p class="text-brand-textSecondary font-semibold text-lg">No payments yet</p>
      <p class="text-brand-textSecondary text-sm">Settle debts from the Settle tab</p>
    </div>

    <!-- List -->
    <div v-else class="flex flex-col gap-3">
      <div
        v-for="payment in payments"
        :key="payment.id"
        class="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(22,100,122,0.06)] flex items-center gap-4"
      >
        <!-- Icon -->
        <div class="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-emerald-600 text-[22px]">payments</span>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-brand-text font-semibold text-sm truncate">
            {{ payment.debtor?.user?.name ?? 'Unknown' }}
            <span class="text-brand-textSecondary font-normal">paid</span>
            {{ payment.creditor?.user?.name ?? 'Unknown' }}
          </p>
          <p class="text-brand-textSecondary text-xs">{{ formatDate(payment.created_at) }}</p>
        </div>

        <!-- Status -->
        <span
          v-if="payment.status"
          class="text-xs font-semibold px-3 py-1 rounded-full shrink-0"
          :class="payment.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'"
        >
          {{ payment.status }}
        </span>

        <!-- Amount -->
        <span class="text-emerald-700 font-extrabold text-base shrink-0">{{ formatCurrency(payment.amount) }}</span>
      </div>

      <!-- Pagination -->
      <div v-if="lastPage > 1" class="flex items-center justify-center gap-2 pt-4">
        <button
          @click="fetchPayments(currentPage - 1)"
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
          @click="fetchPayments(currentPage + 1)"
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
