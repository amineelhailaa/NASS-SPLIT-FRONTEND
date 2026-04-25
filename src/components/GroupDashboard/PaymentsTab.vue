<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/lib/axios'

const props = defineProps({
  groupId: [Number, String],
  group: Object,
})

const { t } = useI18n()

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

function formatDateShort(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function formatCurrency(val) {
  return `${Number(val).toFixed(2)} DH`
}

onMounted(() => fetchPayments())
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h2 class="text-brand-text font-bold text-xl">{{ t('payments.title') }}</h2>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col gap-3">
      <div v-for="n in 4" :key="n" class="animate-pulse bg-brand-surface rounded-2xl h-24" />
    </div>

    <!-- Empty -->
    <div v-else-if="!payments.length" class="flex flex-col items-center justify-center py-24 gap-4">
      <span class="material-symbols-outlined text-[56px] text-brand-disabled">payments</span>
      <p class="text-brand-textSecondary font-semibold text-lg">{{ t('payments.empty') }}</p>
      <p class="text-brand-textSecondary text-sm">{{ t('payments.hint') }}</p>
    </div>

    <!-- List -->
    <div v-else class="flex flex-col gap-3">
      <div
        v-for="payment in payments"
        :key="payment.id"
        class="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(22,100,122,0.06)] flex flex-col gap-3"
      >
        <!-- Transfer row -->
        <div class="flex items-center gap-2 sm:gap-3">

          <!-- Debtor (who paid) -->
          <div class="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
            <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-red-50 shrink-0 overflow-hidden flex items-center justify-center">
              <img
                v-if="payment.debtor?.user?.avatar?.url"
                :src="payment.debtor.user.avatar.url"
                :alt="payment.debtor.user.name"
                class="w-full h-full object-cover"
              />
              <span v-else class="material-symbols-outlined text-red-400 text-[17px] sm:text-[19px]">person</span>
            </div>
            <div class="min-w-0">
              <p class="text-brand-text font-semibold text-xs sm:text-sm truncate leading-tight">
                {{ payment.debtor?.user?.name ?? 'Unknown' }}
              </p>
              <p class="text-brand-textSecondary text-[10px] sm:text-xs leading-tight">{{ t('payments.paid') }}</p>
            </div>
          </div>

          <!-- Arrow -->
          <div class="shrink-0 flex items-center justify-center">
            <span class="material-symbols-outlined text-brand-disabled text-[18px] sm:text-[20px]">arrow_forward</span>
          </div>

          <!-- Creditor (who received) -->
          <div class="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0 justify-end">
            <div class="min-w-0 text-right">
              <p class="text-brand-text font-semibold text-xs sm:text-sm truncate leading-tight">
                {{ payment.creditor?.user?.name ?? 'Unknown' }}
              </p>
              <p class="text-brand-textSecondary text-[10px] sm:text-xs leading-tight">{{ t('payments.received') }}</p>
            </div>
            <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-emerald-50 shrink-0 overflow-hidden flex items-center justify-center">
              <img
                v-if="payment.creditor?.user?.avatar?.url"
                :src="payment.creditor.user.avatar.url"
                :alt="payment.creditor.user.name"
                class="w-full h-full object-cover"
              />
              <span v-else class="material-symbols-outlined text-emerald-500 text-[17px] sm:text-[19px]">person</span>
            </div>
          </div>
        </div>

        <!-- Footer: date + status + amount -->
        <div class="flex items-center justify-between pt-0.5">
          <div class="flex items-center gap-1.5 sm:gap-2">
            <span class="material-symbols-outlined text-brand-disabled text-[13px]">schedule</span>
            <span class="text-brand-textSecondary text-[10px] sm:hidden">{{ formatDateShort(payment.created_at) }}</span>
            <span class="text-brand-textSecondary text-xs hidden sm:block">{{ formatDate(payment.created_at) }}</span>
            <span
              v-if="payment.status"
              class="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full"
              :class="payment.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'"
            >
              {{ payment.status }}
            </span>
          </div>
          <span class="text-emerald-700 font-extrabold text-sm sm:text-base shrink-0">
            {{ formatCurrency(payment.amount) }}
          </span>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="lastPage > 1" class="flex items-center justify-center gap-2 pt-4">
        <button
          @click="fetchPayments(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="px-4 py-2 rounded-full text-sm font-semibold transition-colors"
          :class="currentPage <= 1 ? 'text-brand-disabled bg-brand-surface' : 'text-brand-primary bg-cerulean-50 hover:bg-cerulean-100'"
        >
          {{ t('payments.previous') }}
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
          {{ t('payments.next') }}
        </button>
      </div>
    </div>
  </div>
</template>
