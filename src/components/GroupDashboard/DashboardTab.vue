<script setup>
import StatCard from './StatCard.vue'
import ExpenseTrendChart from './ExpenseTrendChart.vue'
import RecentActivity from './RecentActivity.vue'
import SpendingByCategory from './SpendingByCategory.vue'
import ExpenseCategoryChart from "@/components/GroupDashboard/ExpenseCategoryChart.vue";

const props = defineProps({
  stats: Object,
  owes: Array,
  expenses: Array,
  balance: [Object, Number],
  group: Object,
  groupId: [Number, String],
})
console.log(props.stats)
function formatCurrency(val) {
  if (val == null) return '—'
  const num = Number(val)
  const abs = Math.abs(num).toFixed(2)
  return num < 0 ? `-$${abs}` : `$${abs}`
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Primary Stat Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <StatCard
        label="Total Spent"
        :value="formatCurrency(stats?.total_spent)"
        icon="payments"
      />
      <StatCard
        label="My Balance"
        :value="formatCurrency(typeof balance === 'object' ? balance?.balance : balance)"
        icon="account_balance_wallet"
      />
      <StatCard
        label="Active Members"
        :value="stats?.total_members ?? '—'"
        icon="group"
      />
    </div>

    <!-- Secondary Stat Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <StatCard
        label="Total Expenses"
        :value="stats?.total_expenses ?? '—'"
        icon="receipt_long"
      />
      <StatCard
        label="Paid by Me"
        :value="formatCurrency(stats?.paid_by_me)"
        icon="credit_card"
      />
      <StatCard
        label="My Share"
        :value="formatCurrency(stats?.my_share)"
        icon="pie_chart"
      />
    </div>

    <!-- Expense Trend -->
    <ExpenseTrendChart :daily="stats?.daily_spending ?? []" />

    <!-- Category Breakdown + Recent Activity -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ExpenseCategoryChart :categoriesData="stats?.spending_by_category ?? []" />
      <RecentActivity :expenses="expenses ?? []" :group-id="groupId" />
    </div>
  </div>
</template>
