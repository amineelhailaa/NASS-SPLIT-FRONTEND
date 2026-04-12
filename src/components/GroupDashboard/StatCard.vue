<script setup>
defineProps({
  label: String,
  value: [String, Number],
  icon: String,
})
</script>

<template>
  <div
    class="bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-[0_2px_12px_rgba(22,100,122,0.06)] relative overflow-hidden"
  >
    <!-- Top-left accent bar -->
    <div class="absolute top-0 left-0 w-1 h-12 bg-brand-primary"></div>

    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-cerulean-100 flex items-center justify-center shrink-0">
        <span class="material-symbols-outlined text-brand-primary text-[20px]">{{ icon }}</span>
      </div>
      <span class="text-brand-textSecondary text-sm font-semibold">{{ label }}</span>
    </div>
    <span class="text-brand-text text-4xl font-extrabold tracking-tight">{{ value }}</span>
  </div>
</template>
