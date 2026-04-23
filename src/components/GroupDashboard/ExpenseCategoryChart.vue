<script setup>
import { computed } from 'vue'
import Chart from 'primevue/chart'

const props = defineProps({
  categoriesData: {
    type: Array,
    default: () => [],
  },
})
console.log(props.categoriesData)
const COLORS = [
  '#16647a', '#387d94', '#5a96ae', '#7db0c6', '#a0c9de',
  '#c3e2f0', '#3d8a6e', '#5aaa8a', '#78c9a6', '#96e8c2',
]

const hasData = computed(() => props.categoriesData.length > 0)
const chartData = computed(() => ({
  labels: props.categoriesData.map((d) => d.category?.name ?? d.category ?? 'Uncategorized'),
  datasets: [
    {
      label: 'Expenses by Category',
      data: props.categoriesData.map((d) => Number(d.total)),
      backgroundColor: props.categoriesData.map((category, i) => COLORS[i % COLORS.length]),
      borderWidth: 0,
      hoverOffset: 6,
    },
  ],
}))

const chartOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#213c45',
        font: { family: 'Plus Jakarta Sans', size: 12 },
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: '#ffffff',
      titleColor: '#161d1f',
      bodyColor: '#40484c',
      borderColor: 'rgba(22, 100, 122, 0.12)',
      borderWidth: 1,
      cornerRadius: 12,
      displayColors: true,
      padding: 10,
      titleFont: { family: 'Plus Jakarta Sans', weight: '600' },
      bodyFont: { family: 'Plus Jakarta Sans' },
    },
  },
}
</script>

<template>
  <div class="flex flex-col items-center justify-center w-full h-full">
    <div
      v-if="!hasData"
      class="flex flex-col items-center justify-center gap-3 py-10 text-brand-textSecondary"
    >
      <span class="material-symbols-outlined text-[36px] text-brand-disabled">pie_chart</span>
      <p class="text-[13px] font-medium">Not enough data yet</p>
    </div>
    <div v-else class="w-full" style="height: 280px">
      <Chart type="doughnut" :data="chartData" :options="chartOptions" class="w-full h-full" />
    </div>
  </div>
</template>