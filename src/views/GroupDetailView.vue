<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardTab from '@/components/GroupDashboard/DashboardTab.vue'
import ExpensesTab from '@/components/GroupDashboard/ExpensesTab.vue'
import PaymentsTab from '@/components/GroupDashboard/PaymentsTab.vue'
import SettleTab from '@/components/GroupDashboard/SettleTab.vue'
import ChatTab from '@/components/GroupDashboard/ChatTab.vue'
import MembersTab from '@/components/GroupDashboard/MembersTab.vue'
import SettingsTab from '@/components/GroupDashboard/SettingsTab.vue'
import api from '@/lib/axios'

const route = useRoute()
const router = useRouter()
const groupId = route.params.id

const group = ref(null)
const stats = ref(null)
const owes = ref([])
const expenses = ref([])
const balance = ref(null)
const loading = ref(true)
const error = ref(null)
const activeTab = ref('dashboard')

const isOwner = computed(() =>
  group.value?.pivot?.role === 'owner' || history.state?.role === 'owner'
)

const tabs = computed(() => [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', component: DashboardTab },
  { key: 'expenses', label: 'Expenses', icon: 'receipt_long', component: ExpensesTab },
  { key: 'payments', label: 'My Payments', icon: 'payments', component: PaymentsTab },
  { key: 'settle', label: 'Settle', icon: 'handshake', component: SettleTab },
  { key: 'chat', label: 'Chat', icon: 'chat', component: ChatTab },
  { key: 'members', label: 'Members', icon: 'group', component: MembersTab },
  ...(isOwner.value
    ? [{ key: 'settings', label: 'Settings', icon: 'settings', component: SettingsTab }]
    : []),
])

const currentComponent = computed(() =>
  tabs.value.find((t) => t.key === activeTab.value)?.component
)

onMounted(async () => {
  try {
    const [groupRes, statsRes, owesRes, expensesRes, balanceRes] = await Promise.all([
      api.get(`/api/v1/groups/${groupId}`),
      api.get(`/api/v1/groups/${groupId}/statistics`),
      api.get(`/api/v1/groups/${groupId}/owes`),
      api.get(`/api/v1/groups/${groupId}/expenses`, { params: { per_page: 4 } }),
      api.get(`/api/v1/groups/${groupId}/balance`),
    ])
    group.value = groupRes.data.data
    console.log(groupRes);
    stats.value = statsRes.data.data
    owes.value = owesRes.data.data
    expenses.value = expensesRes.data.data.data
    balance.value = balanceRes.data.data
  } catch {
    error.value = 'Failed to load group data.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-brand-background flex" style="font-family: 'Plus Jakarta Sans', sans-serif">
    <!-- Sidebar -->
    <aside
      class="group/sb fixed inset-y-0 left-0 z-50 flex flex-col w-16 hover:w-56 overflow-hidden transition-[width] duration-200 ease-out bg-white shadow-[4px_0_16px_rgba(22,100,122,0.06)]"
    >
      <!-- Top -->
      <div class="flex flex-col gap-1 py-3">
        <!-- Back -->
        <button
          @click="router.push({ name: 'groups' })"
          class="flex items-center gap-3 h-10 px-5 text-brand-textSecondary hover:text-brand-primary transition-colors"
        >
          <span class="material-symbols-outlined text-[20px] shrink-0">arrow_back</span>
          <span
            class="text-sm font-semibold whitespace-nowrap overflow-hidden max-w-0 group-hover/sb:max-w-48 transition-[max-width] duration-200"
          >
            Back
          </span>
        </button>

        <!-- Group avatar + name -->
        <div class="flex items-center gap-3 h-12 px-5">
          <div class="w-8 h-8 rounded-lg bg-cerulean-100 shrink-0 overflow-hidden">
            <img
              v-if="group?.avatar?.url"
              :src="group.avatar.url"
              :alt="group?.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <span class="material-symbols-outlined text-brand-primary text-[16px]">group</span>
            </div>
          </div>
          <span
            class="text-sm font-bold text-brand-text whitespace-nowrap overflow-hidden max-w-0 group-hover/sb:max-w-48 transition-[max-width] duration-200"
          >
            {{ group?.name ?? '...' }}
          </span>
        </div>
      </div>

      <div class="h-px mx-4 bg-cerulean-50" />

      <!-- Tabs -->
      <nav class="flex flex-col gap-0.5 px-2 py-3 flex-1">
        <!-- Home -->
        <button
          @click="router.push({ name: 'home' })"
          class="flex items-center gap-3 h-10 px-3 rounded-lg transition-colors w-full text-brand-textSecondary hover:bg-cerulean-50/50 hover:text-brand-primary"
        >
          <span class="material-symbols-outlined text-[20px] shrink-0">home</span>
          <span class="text-sm whitespace-nowrap overflow-hidden max-w-0 group-hover/sb:max-w-48 transition-[max-width] duration-200">
            Home
          </span>
        </button>

        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="flex items-center gap-3 h-10 px-3 rounded-lg transition-colors w-full"
          :class="
            activeTab === tab.key
              ? 'bg-cerulean-50 text-brand-primary font-bold'
              : 'text-brand-textSecondary hover:bg-cerulean-50/50 hover:text-brand-primary'
          "
        >
          <span class="material-symbols-outlined text-[20px] shrink-0">{{ tab.icon }}</span>
          <span
            class="text-sm whitespace-nowrap overflow-hidden max-w-0 group-hover/sb:max-w-48 transition-[max-width] duration-200"
          >
            {{ tab.label }}
          </span>
        </button>
      </nav>

      <!-- Leave Group (non-owners only) -->
      <button
        v-if="!isOwner"
        class="flex items-center gap-3 h-10 px-5 py-4 text-red-500 hover:text-red-600 transition-colors"
      >
        <span class="material-symbols-outlined text-[20px] shrink-0">logout</span>
        <span
          class="text-sm font-semibold whitespace-nowrap overflow-hidden max-w-0 group-hover/sb:max-w-48 transition-[max-width] duration-200"
        >
          Leave Group
        </span>
      </button>
    </aside>

    <!-- Main -->
    <div class="flex-1 pl-20">
      <main class="px-8 md:px-12 py-8">
        <!-- Loading -->
        <div v-if="loading" class="flex flex-col gap-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div v-for="n in 3" :key="n" class="animate-pulse bg-brand-surface rounded-2xl h-28" />
          </div>
          <div class="animate-pulse bg-brand-surface rounded-2xl h-48" />
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="n in 2" :key="n" class="animate-pulse bg-brand-surface rounded-2xl h-56" />
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="flex flex-col items-center justify-center py-24 gap-4">
          <span class="material-symbols-outlined text-[56px] text-brand-disabled">error</span>
          <p class="text-brand-textSecondary font-semibold text-lg">{{ error }}</p>
        </div>

        <!-- Content -->
        <component
          v-else
          :is="currentComponent"
          :group="group"
          :stats="stats"
          :owes="owes"
          :expenses="expenses"
          :balance="balance"
          :group-id="groupId"
        />
      </main>
    </div>
  </div>
</template>
