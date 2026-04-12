<script setup>
import { computed } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => [],
  },
})

const total = computed(() =>
  props.categories.reduce((sum, c) => sum + Number(c.total), 0)
)

const items = computed(() =>
  props.categories
    .map((c) => ({
      name: c.category?.name ?? 'Uncategorized',
      amount: Number(c.total),
      percent: total.value > 0 ? (Number(c.total) / total.value) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
)

const colors = [
  'bg-cerulean-700',
  'bg-cerulean-500',
  'bg-cerulean-400',
  'bg-cerulean-300',
  'bg-cerulean-200',
  'bg-cerulean-100',
]
</script>

<template>
  <div class="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(22,100,122,0.06)]">
    <h3 class="text-brand-text font-bold text-lg pb-5 border-b border-brand-border mb-5">
      Spending by Category
    </h3>

    <div v-if="!items.length" class="flex flex-col items-center justify-center py-8 gap-2">
      <span class="material-symbols-outlined text-[40px] text-brand-disabled">category</span>
      <p class="text-brand-textSecondary text-sm font-medium">No category data yet</p>
    </div>

    <div v-else class="flex flex-col gap-4">
      <!-- Stacked bar -->
      <div class="flex h-3 rounded-full overflow-hidden">
        <div
          v-for="(item, i) in items"
          :key="item.name"
          :class="colors[i % colors.length]"
          :style="{ width: item.percent + '%' }"
          class="transition-all duration-300"
        />
      </div>

      <!-- Legend list -->
      <div class="flex flex-col gap-3 pt-2">
        <div
          v-for="(item, i) in items"
          :key="item.name"
          class="flex items-center gap-3"
        >
          <span class="w-3 h-3 rounded-full shrink-0" :class="colors[i % colors.length]" />
          <span class="text-brand-text text-sm font-semibold flex-1">{{ item.name }}</span>
          <span class="text-brand-textSecondary text-xs font-medium">{{ item.percent.toFixed(0) }}%</span>
          <span class="text-cerulean-700 text-sm font-extrabold">${{ item.amount.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
