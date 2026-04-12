<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  expenses: {
    type: Array,
    default: () => [],
  },
  groupId: [Number, String],
})

const router = useRouter()

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(22,100,122,0.06)]">
    <h3 class="text-brand-text font-bold text-lg pb-5 border-b border-brand-border mb-5">Recent Activity</h3>

    <div v-if="!expenses.length" class="flex flex-col items-center justify-center py-8 gap-2">
      <span class="material-symbols-outlined text-[40px] text-brand-disabled">receipt_long</span>
      <p class="text-brand-textSecondary text-sm font-medium">No expenses yet</p>
    </div>

    <div v-else class="flex flex-col gap-0">
      <div
        v-for="(expense, idx) in expenses.slice(0, 4)"
        :key="expense.id"
        class="flex items-center gap-3 py-3 px-2 hover:bg-brand-surface transition-colors rounded-lg"
        :class="{ 'border-b border-brand-border': idx < expenses.slice(0, 4).length - 1 }"
      >
        <div class="w-10 h-10 rounded-full bg-cerulean-50 flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-brand-primary text-[18px]">receipt</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-brand-text text-sm font-semibold truncate">{{ expense.title }}</p>
          <p class="text-brand-textSecondary text-xs">
            {{ formatDate(expense.date) }}
            <span v-if="expense.payer?.user?.name"> · {{ expense.payer.user.name }}</span>
            <span v-if="expense.category?.name"> · {{ expense.category.name }}</span>
          </p>
        </div>
        <span class="text-cerulean-700 font-extrabold text-sm shrink-0">${{ Number(expense.amount).toFixed(2) }}</span>
      </div>

      <button
        v-if="expenses.length >= 4"
        @click="router.push({ name: 'group-detail', params: { id: groupId } })"
        class="w-full text-center text-cerulean-700 text-sm font-bold py-3 rounded-full bg-cerulean-50 hover:bg-cerulean-100 transition-colors mt-3"
      >
        View more
      </button>
    </div>
  </div>
</template>
