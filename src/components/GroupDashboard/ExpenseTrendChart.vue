<script setup>
import { computed, ref } from 'vue'
import Chart from 'primevue/chart'
const props = defineProps({
  daily: {
    type: Array,
    default: () => [],
  },
})



const isMobile = ref(window.innerWidth < 640)
const hasData = computed(() => props.daily.some((d) => Number(d.total) > 0))




const formatDayLabel = (day) => {
  const date = new Date(day)
  const month = date.toLocaleString('en-US', { month: 'short' })

  return `${date.getDate()} ${month}`
}

const chartData = computed(() => ({
  labels: props.daily.map(item => formatDayLabel(item.day)),
  datasets: [
    {
      label: 'Expense Timeline',
      data: props.daily.map(item => Number(item.total)),
      borderColor: '#16647a',
      backgroundColor: 'rgba(56, 125, 148, 0.12)',
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#16647a',
      pointHoverBackgroundColor: '#16647a',
      pointHoverBorderColor: '#ffffff',
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBorderWidth: 2,
      borderWidth: 3,
      tension: 0.35,
      fill: true,
    }
  ]
}))

const chartOptions = computed(() => ({
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#ffffff',
      titleColor: '#161d1f',
      bodyColor: '#40484c',
      borderColor: 'rgba(22, 100, 122, 0.12)',
      borderWidth: 1,
      cornerRadius: 16,
      displayColors: false,
      padding: 12,
      titleFont: {
        family: 'Plus Jakarta Sans',
        weight: '600',
      },
      bodyFont: {
        family: 'Plus Jakarta Sans',
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
      ticks: {
        autoSkip: true,
        maxTicksLimit: isMobile? 5: 7,
        color: '#40484c',
        font: {
          family: 'Plus Jakarta Sans',
          size: 11,
          weight: '500',
        },
        maxRotation: 0,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(22, 100, 122, 0.08)',
        drawBorder: false,
      },
      border: {
        display: false,
      },
      ticks: {
        color: '#40484c',
        font: {
          family: 'Plus Jakarta Sans',
          size: 11,
        },
      },
    },
  },
}))


</script>

<template>
  <div class="w-full rounded-4xl bg-white p-7 shadow-[0_20px_40px_rgba(22,100,122,0.06)]">
    <div class="mb-5 flex flex-col gap-1.5">
      <p class="m-0 text-[0.8rem] font-semibold uppercase tracking-[0.04em] text-[#40484c]">Last 30 days</p>
      <h3 class="m-0 text-[1.35rem] font-bold leading-[1.2] text-[#161d1f]">Expense timeline</h3>
    </div>
    <div class="h-105 w-full">
      <div
        v-if="!hasData"
        class="h-full flex flex-col items-center justify-center gap-3 text-brand-textSecondary"
      >
        <span class="material-symbols-outlined text-[36px] text-brand-disabled">show_chart</span>
        <p class="text-[13px] font-medium">Not enough data yet</p>
      </div>
      <Chart v-else type="line" :data="chartData" :options="chartOptions" class="h-full w-full" />
    </div>
  </div>
</template>
