<script setup>
import { computed } from 'vue'

const props = defineProps({
  daily: {
    type: Array,
    default: () => [],
  },
})

const WIDTH = 600
const HEIGHT = 120
const PADDING = 8

const chartData = computed(() => {
  const data = props.daily.slice(-30)
  if (data.length >= 2) return data
  // Fallback: flat line so the chart always renders
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => ({
    day: new Date(today - (6 - i) * 86400000).toISOString().slice(0, 10),
    total: 0,
  }))
})

const points = computed(() => {
  const data = chartData.value
  const maxVal = Math.max(...data.map((d) => d.total), 1)
  const step = (WIDTH - PADDING * 2) / (data.length - 1)

  return data
    .map((d, i) => {
      const x = PADDING + i * step
      const y = PADDING + (1 - d.total / maxVal) * (HEIGHT - PADDING * 2)
      return `${x},${y}`
    })
    .join(' ')
})

const areaPoints = computed(() => {
  const data = chartData.value
  const maxVal = Math.max(...data.map((d) => d.total), 1)
  const step = (WIDTH - PADDING * 2) / (data.length - 1)

  const top = data
    .map((d, i) => {
      const x = PADDING + i * step
      const y = PADDING + (1 - d.total / maxVal) * (HEIGHT - PADDING * 2)
      return `${x},${y}`
    })
    .join(' ')

  const lastX = PADDING + (data.length - 1) * step
  return `${top} ${lastX},${HEIGHT - PADDING} ${PADDING},${HEIGHT - PADDING}`
})

const xLabels = computed(() => {
  const data = chartData.value
  const step = (WIDTH - PADDING * 2) / (data.length - 1)
  const indices = [
    0,
    Math.floor(data.length / 4),
    Math.floor(data.length / 2),
    Math.floor((3 * data.length) / 4),
    data.length - 1,
  ]

  return indices.map((i) => ({
    x: PADDING + i * step,
    label: new Date(data[i].day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))
})
</script>

<template>
  <div class="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(22,100,122,0.06)]">
    <div class="flex items-center justify-between pb-6">
      <h3 class="text-brand-text font-bold text-lg">Expense Trend</h3>
      <span class="text-brand-textSecondary text-xs font-semibold px-3 py-1 bg-cerulean-50 rounded-full">
        Last 30 days
      </span>
    </div>

    <svg
      :viewBox="`0 0 ${WIDTH} ${HEIGHT + 20}`"
      preserveAspectRatio="none"
      class="w-full h-36 md:h-44"
    >
      <line
        x1="0" :y1="PADDING" :x2="WIDTH" :y2="PADDING"
        stroke="rgba(22,100,122,0.04)" stroke-width="1"
      />
      <line
        x1="0" :y1="PADDING + (HEIGHT - PADDING * 2) * 0.5"
        :x2="WIDTH" :y2="PADDING + (HEIGHT - PADDING * 2) * 0.5"
        stroke="rgba(22,100,122,0.04)" stroke-width="1"
      />
      <polygon :points="areaPoints" fill="rgba(22,100,122,0.10)" />
      <polyline
        :points="points"
        fill="none"
        stroke="#16647a"
        stroke-width="2.5"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </svg>

    <div class="relative w-full pt-2">
      <svg :viewBox="`0 0 ${WIDTH} 16`" preserveAspectRatio="none" class="w-full h-4">
        <text
          v-for="label in xLabels"
          :key="label.x"
          :x="label.x"
          y="12"
          text-anchor="middle"
          font-size="11"
          fill="#7a9aaa"
          font-family="Plus Jakarta Sans, sans-serif"
        >
          {{ label.label }}
        </text>
      </svg>
    </div>
  </div>
</template>
