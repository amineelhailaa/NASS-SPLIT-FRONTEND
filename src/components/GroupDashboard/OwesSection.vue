<script setup>
defineProps({
  owes: {
    type: Array,
    default: () => [],
  },
})

function avatarUrl(user) {
  return user?.avatar?.url ?? null
}

function initials(name) {
  return name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<template>
  <div class="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(22,100,122,0.06)]">
    <h3 class="text-brand-text font-bold text-lg pb-5 border-b border-brand-border mb-5">Who Owes Who</h3>

    <div v-if="!owes.length" class="flex flex-col items-center justify-center py-8 gap-2">
      <span class="material-symbols-outlined text-[40px] text-brand-disabled">check_circle</span>
      <p class="text-brand-textSecondary text-sm font-medium">All settled up!</p>
    </div>

    <div v-else class="flex flex-col gap-3">
      <div
        v-for="(owe, i) in owes.slice(0, 5)"
        :key="i"
        class="flex items-center gap-3 bg-cerulean-50 rounded-xl px-3 py-2.5 transition-colors hover:bg-cerulean-100"
      >
        <!-- Debtor -->
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <div
            class="w-8 h-8 rounded-full bg-cerulean-100 flex items-center justify-center shrink-0 overflow-hidden"
          >
            <img
              v-if="avatarUrl(owe.debtor)"
              :src="avatarUrl(owe.debtor)"
              :alt="owe.debtor.name"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-cerulean-700 text-xs font-bold">{{ initials(owe.debtor.name) }}</span>
          </div>
          <span class="text-brand-text text-sm font-semibold truncate">{{ owe.debtor.name }}</span>
        </div>

        <!-- Arrow icon -->
        <span class="material-symbols-outlined text-brand-primary text-[18px] shrink-0">arrow_forward</span>

        <!-- Amount -->
        <span class="text-cerulean-700 font-extrabold text-sm shrink-0 px-1">${{ Number(owe.amount).toFixed(2) }}</span>

        <!-- Creditor -->
        <div class="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span class="text-brand-text text-sm font-semibold truncate">{{ owe.creditor.name }}</span>
          <div
            class="w-8 h-8 rounded-full bg-cerulean-100 flex items-center justify-center shrink-0 overflow-hidden"
          >
            <img
              v-if="avatarUrl(owe.creditor)"
              :src="avatarUrl(owe.creditor)"
              :alt="owe.creditor.name"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-cerulean-700 text-xs font-bold">{{ initials(owe.creditor.name) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
