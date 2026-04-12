<script setup>
import { ref, onMounted } from 'vue'
import api from '@/lib/axios'

const props = defineProps({
  groupId: [Number, String],
  group: Object,
})

const expenses = ref([])
const loading = ref(true)
const currentPage = ref(1)
const lastPage = ref(1)

async function fetchExpenses(page = 1) {
  loading.value = true
  try {
    const res = await api.get(`/api/v1/groups/${props.groupId}/expenses`, {
      params: { page, per_page: 10 },
    })
    expenses.value = res.data.data.data
    currentPage.value = res.data.data.current_page
    lastPage.value = res.data.data.last_page
  } catch {
    expenses.value = []
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

onMounted(() => fetchExpenses())
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h2 class="text-brand-text font-bold text-xl">Expenses</h2>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col gap-3">
      <div v-for="n in 5" :key="n" class="animate-pulse bg-brand-surface rounded-2xl h-20" />
    </div>

    <!-- Empty -->
    <div v-else-if="!expenses.length" class="flex flex-col items-center justify-center py-24 gap-4">
      <span class="material-symbols-outlined text-[56px] text-brand-disabled">receipt_long</span>
      <p class="text-brand-textSecondary font-semibold text-lg">No expenses yet</p>
    </div>

    <!-- List -->
    <div v-else class="flex flex-col gap-3">
      <div
        v-for="expense in expenses"
        :key="expense.id"
        class="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(22,100,122,0.06)] flex items-center gap-4"
      >
        <!-- Icon -->
        <div class="w-12 h-12 rounded-full bg-cerulean-50 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-brand-primary text-[22px]">receipt</span>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-brand-text font-semibold text-sm truncate">{{ expense.title }}</p>
          <p class="text-brand-textSecondary text-xs">
            {{ formatDate(expense.date) }}
            <span v-if="expense.payer?.user?.name"> · Paid by {{ expense.payer.user.name }}</span>
          </p>
          <p v-if="expense.category?.name" class="text-brand-textSecondary text-xs">
            {{ expense.category.name }}
          </p>
        </div>

        <!-- Splits count -->
        <div v-if="expense.splits?.length" class="flex items-center gap-1 shrink-0">
          <span class="material-symbols-outlined text-brand-textSecondary text-[16px]">group</span>
          <span class="text-brand-textSecondary text-xs font-medium">{{ expense.splits.length }}</span>
        </div>

        <!-- Amount -->
        <span class="text-cerulean-700 font-extrabold text-base shrink-0">{{ formatCurrency(expense.amount) }}</span>
      </div>

      <!-- Pagination -->
      <div v-if="lastPage > 1" class="flex items-center justify-center gap-2 pt-4">
        <button
          @click="fetchExpenses(currentPage - 1)"
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
          @click="fetchExpenses(currentPage + 1)"
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
