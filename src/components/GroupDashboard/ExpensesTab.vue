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
const hoveredSplitId = ref(null)

const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
const downloading = ref(false)

async function downloadExpenses() {
  downloading.value = true
  try {
    const url = `${import.meta.env.VITE_API_URL}/api/v1/groups/${props.groupId}/expenses?export=1`
    const a = document.createElement('a')
    a.href = url
    a.download = 'expenses.xlsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } finally {
    setTimeout(() => { downloading.value = false }, 1000)
  }
}

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

function formatDateShort(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function formatCurrency(val) {
  return `$${Number(val).toFixed(2)}`
}

function myShare(expense) {
  const split = expense.splits?.find((s) => s.debtor?.user?.id === currentUser.id)
  return split ? Number(split.amount).toFixed(2) : null
}

onMounted(() => fetchExpenses())
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h2 class="text-brand-text font-bold text-xl">Expenses</h2>
      <button
        @click="downloadExpenses"
        :disabled="downloading"
        class="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
        :class="downloading ? 'text-brand-disabled bg-brand-surface cursor-not-allowed' : 'text-brand-primary bg-cerulean-50 hover:bg-cerulean-100'"
      >
        <span class="material-symbols-outlined text-[17px]">{{ downloading ? 'hourglass_empty' : 'download' }}</span>
        <span class="hidden sm:inline">{{ downloading ? 'Downloading…' : 'Export' }}</span>
      </button>
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
        class="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(22,100,122,0.06)] flex items-center gap-3 sm:gap-4"
      >
        <!-- Payer avatar / fallback icon -->
        <div
          class="w-10 h-10 sm:w-12 sm:h-12 rounded-full shrink-0 overflow-hidden flex items-center justify-center"
          :class="expense.payer?.user?.avatar?.url ? '' : 'bg-cerulean-50'"
        >
          <img
            v-if="expense.payer?.user?.avatar?.url"
            :src="expense.payer.user.avatar.url"
            :alt="expense.payer.user.name"
            class="w-full h-full object-cover"
          />
          <span v-else class="material-symbols-outlined text-brand-primary text-[20px] sm:text-[22px]">receipt</span>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0 flex flex-col gap-0.5">
          <p class="text-brand-text font-semibold text-sm truncate">{{ expense.title }}</p>

          <!-- Mobile meta -->
          <p class="text-brand-textSecondary text-xs truncate sm:hidden">
            {{ formatDateShort(expense.date) }}
            <span v-if="expense.payer?.user?.name"> · {{ expense.payer.user.name }}</span>
          </p>

          <!-- Desktop meta -->
          <div class="hidden sm:flex items-center gap-2 flex-wrap">
            <span class="text-brand-textSecondary text-xs">{{ formatDate(expense.date) }}</span>
            <span v-if="expense.payer?.user?.name" class="text-brand-disabled text-xs">·</span>
            <span v-if="expense.payer?.user?.name" class="text-brand-textSecondary text-xs">
              Paid by {{ expense.payer.user.name }}
            </span>
          </div>

          <!-- Category + your share (desktop only) -->
          <div class="hidden sm:flex items-center gap-2 mt-0.5">
            <span
              v-if="expense.category?.name"
              class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cerulean-50 text-brand-primary"
            >
              {{ expense.category.name }}
            </span>
            <span
              v-if="myShare(expense)"
              class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-surface text-brand-textSecondary"
            >
              Your share: ${{ myShare(expense) }}
            </span>
          </div>
        </div>

        <!-- Right side: participants + amount -->
        <div class="flex items-center gap-2 shrink-0">

          <!-- Participant count with hover tooltip (desktop only) -->
          <div
            v-if="expense.splits?.length"
            class="hidden sm:block relative"
            @mouseenter="hoveredSplitId = expense.id"
            @mouseleave="hoveredSplitId = null"
          >
            <button
              class="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-cerulean-50 transition-colors cursor-default"
            >
              <span class="material-symbols-outlined text-brand-textSecondary text-[15px]">group</span>
              <span class="text-brand-textSecondary text-xs font-medium">{{ expense.splits.length }}</span>
            </button>

            <!-- Tooltip -->
            <div
              v-if="hoveredSplitId === expense.id"
              class="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-2xl shadow-[0_8px_24px_rgba(22,100,122,0.13)] p-3 z-50 flex flex-col gap-2"
            >
              <p class="text-brand-textSecondary text-[10px] font-semibold uppercase tracking-wide">
                Split between
              </p>
              <div
                v-for="split in expense.splits"
                :key="split.id"
                class="flex items-center gap-2.5"
              >
                <div class="w-6 h-6 rounded-full bg-cerulean-50 shrink-0 overflow-hidden flex items-center justify-center">
                  <img
                    v-if="split.debtor?.user?.avatar?.url"
                    :src="split.debtor.user.avatar.url"
                    :alt="split.debtor.user.name"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="material-symbols-outlined text-[11px] text-brand-primary">person</span>
                </div>
                <span class="text-brand-text text-xs font-medium flex-1 truncate">
                  {{ split.debtor?.user?.name }}
                </span>
                <span class="text-cerulean-700 text-xs font-bold shrink-0">
                  ${{ Number(split.amount).toFixed(2) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Amount -->
          <span class="text-cerulean-700 font-extrabold text-sm sm:text-base">
            {{ formatCurrency(expense.amount) }}
          </span>
        </div>
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