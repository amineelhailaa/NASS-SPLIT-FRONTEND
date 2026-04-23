<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/lib/axios'
import ExpenseTrendChart from '@/components/GroupDashboard/ExpenseTrendChart.vue'
import ExpenseCategoryChart from '@/components/GroupDashboard/ExpenseCategoryChart.vue'

const totalGroups = ref(0)
const totalCategories = ref(0)
const totalExpenses = ref(0)
const dailyExpenses = ref([])
const categoryUse = ref([])
const loading = ref(false)

async function loadStats() {
  loading.value = true
  try {
    const groupsResponse = await api.get('/api/v1/groups')
    const categoriesResponse = await api.get('/api/v1/categories')
    const expensesResponse = await api.get('/api/v1/expenses/statistics')
    const categoryUseResponse = await api.get('/api/v1/expenses/category-use')
    // console.log(categoryUseResponse,"eye on here , somethign related to category stats ")

    totalGroups.value = groupsResponse.data.data.total ?? 0
    totalCategories.value = categoriesResponse.data.data.total ?? 0
    dailyExpenses.value = expensesResponse.data.data.dailySpending ?? []
    totalExpenses.value = dailyExpenses.value.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0,
    )
    // console.log(categoryUseResponse);
    categoryUse.value = categoryUseResponse.data
    console.log(categoryUse)

  } catch (error) {
    console.error('Failed to load stats', error)
  } finally {
    loading.value = false
  }
}

function formatMoney(value) {
  const number = Number(value) || 0
  return number.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

onMounted(loadStats)
</script>

<template>
  <div class="flex flex-col gap-7">
    <!-- Page head -->
    <div class="flex flex-col gap-2 pt-5">
      <span
        class="text-brand-primary font-semibold text-[12px] uppercase tracking-[0.14em]"
      >
        Admin · Overview
      </span>
      <h1
        class="text-brand-text font-extrabold text-[38px] leading-[1.05] tracking-[-0.03em] m-0"
      >
        Dashboard
      </h1>
      <p class="text-brand-textSecondary text-sm pt-1">
        Quick stats about the platform.
      </p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4.5">
      <!-- Total Groups -->
      <div
        class="bg-white rounded-3xl px-6 py-5.5 flex flex-col gap-4.5 min-h-[170px]"
        style="box-shadow: 0 1px 2px rgba(22, 100, 122, 0.06), 0 2px 8px rgba(22, 100, 122, 0.04)"
      >
        <div class="flex items-start justify-between">
          <span class="text-brand-textSecondary text-[13px] font-medium">
            Total Groups
          </span>
          <div
            class="w-9 h-9 rounded-xl bg-brand-background text-brand-primary flex items-center justify-center"
          >
            <span class="material-symbols-outlined text-[18px]">groups</span>
          </div>
        </div>
        <div
          class="text-brand-text text-[40px] font-extrabold leading-none tracking-[-0.035em]"
        >
          {{ loading ? '…' : totalGroups }}
        </div>
        <div
          class="flex items-center gap-2.5 text-[12px] text-brand-textSecondary mt-auto"
        >
          <span
            class="px-2.5 py-0.5 rounded-full font-semibold text-[11.5px] bg-brand-background text-brand-primaryHover"
          >
            Active
          </span>
          <span>across the platform</span>
        </div>
      </div>

      <!-- Total Categories -->
      <div
        class="bg-white rounded-3xl px-6 py-5.5 flex flex-col gap-4.5 min-h-[170px]"
        style="box-shadow: 0 1px 2px rgba(22, 100, 122, 0.06), 0 2px 8px rgba(22, 100, 122, 0.04)"
      >
        <div class="flex items-start justify-between">
          <span class="text-brand-textSecondary text-[13px] font-medium">
            Total Categories
          </span>
          <div
            class="w-9 h-9 rounded-xl bg-brand-background text-brand-primary flex items-center justify-center"
          >
            <span class="material-symbols-outlined text-[18px]">category</span>
          </div>
        </div>
        <div
          class="text-brand-text text-[40px] font-extrabold leading-none tracking-[-0.035em]"
        >
          {{ loading ? '…' : totalCategories }}
        </div>
        <div
          class="flex items-center gap-2.5 text-[12px] text-brand-textSecondary mt-auto"
        >
          <span
            class="px-2.5 py-0.5 rounded-full font-semibold text-[11.5px] bg-brand-background text-brand-primaryHover"
          >
            Expense types
          </span>
        </div>
      </div>

      <!-- Total Expenses (30d) -->
      <div
        class="bg-white rounded-3xl px-6 py-5.5 flex flex-col gap-4.5 min-h-[170px]"
        style="box-shadow: 0 1px 2px rgba(22, 100, 122, 0.06), 0 2px 8px rgba(22, 100, 122, 0.04)"
      >
        <div class="flex items-start justify-between">
          <span class="text-brand-textSecondary text-[13px] font-medium">
            Expenses · 30d
          </span>
          <div
            class="w-9 h-9 rounded-xl bg-brand-background text-brand-primary flex items-center justify-center"
          >
            <span class="material-symbols-outlined text-[18px]">payments</span>
          </div>
        </div>
        <div
          class="text-brand-text text-[40px] font-extrabold leading-none tracking-[-0.035em]"
        >
          {{ loading ? '…' : formatMoney(totalExpenses) }}
        </div>
        <div
          class="flex items-center gap-2.5 text-[12px] text-brand-textSecondary mt-auto"
        >
          <span
            class="px-2.5 py-0.5 rounded-full font-semibold text-[11.5px] bg-brand-background text-brand-primaryHover"
          >
            Last 30 days
          </span>
        </div>
      </div>

      <!-- Admin Role -->
      <div
        class="bg-white rounded-3xl px-6 py-5.5 flex flex-col gap-4.5 min-h-[170px]"
        style="box-shadow: 0 1px 2px rgba(22, 100, 122, 0.06), 0 2px 8px rgba(22, 100, 122, 0.04)"
      >
        <div class="flex items-start justify-between">
          <span class="text-brand-textSecondary text-[13px] font-medium">
            Admin Role
          </span>
          <div
            class="w-9 h-9 rounded-xl bg-brand-background text-brand-primary flex items-center justify-center"
          >
            <span class="material-symbols-outlined text-[18px]">shield</span>
          </div>
        </div>
        <div
          class="text-brand-text text-[28px] font-extrabold leading-tight tracking-[-0.02em]"
        >
          Active
        </div>
        <div
          class="flex items-center gap-2.5 text-[12px] text-brand-textSecondary mt-auto"
        >
          <span
            class="px-2.5 py-0.5 rounded-full font-semibold text-[11.5px] bg-brand-background text-brand-primaryHover"
          >
            Privileged
          </span>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="xl:col-span-2">
        <ExpenseTrendChart :daily="dailyExpenses" />
      </div>
      <div
        class="bg-white rounded-3xl p-6 flex flex-col gap-4"
        style="box-shadow: 0 1px 2px rgba(22, 100, 122, 0.06), 0 2px 8px rgba(22, 100, 122, 0.04)"
      >
        <div class="flex flex-col gap-1.5">
          <p
            class="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-disabled"
          >
            Distribution
          </p>
          <h3
            class="text-[20px] font-bold text-brand-text tracking-[-0.02em] leading-tight"
          >
            Expenses by category
          </h3>
        </div>
        <ExpenseCategoryChart :categories-data="categoryUse" />
      </div>
    </div>
  </div>
</template>