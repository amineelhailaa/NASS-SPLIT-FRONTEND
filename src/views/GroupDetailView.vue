<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DashboardTab from '@/components/GroupDashboard/DashboardTab.vue'
import ExpensesTab from '@/components/GroupDashboard/ExpensesTab.vue'
import PaymentsTab from '@/components/GroupDashboard/PaymentsTab.vue'
import SettleTab from '@/components/GroupDashboard/SettleTab.vue'
import ChatTab from '@/components/GroupDashboard/ChatTab.vue'
import MembersTab from '@/components/GroupDashboard/MembersTab.vue'
import SettingsTab from '@/components/GroupDashboard/SettingsTab.vue'
import InvitationsTab from '@/components/GroupDashboard/InvitationsTab.vue'
import AddExpenseForm from '@/components/GroupDashboard/AddExpenseForm.vue'
import NotificationBell from '@/components/NotificationBell.vue'
import api from '@/lib/axios'
import Swal from 'sweetalert2'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const groupId = route.params.id

const showExpenseForm = ref(false)

const group = ref(null)
const stats = ref(null)
const owes = ref([])
const expenses = ref([])
const balance = ref(null)
const loading = ref(true)
const error = ref(null)
const storageKey = `activeTab_group_${groupId}`
const activeTab = ref(route.query.tab || localStorage.getItem(storageKey) || 'dashboard')

watch(activeTab, (tab) => {
  localStorage.setItem(storageKey, tab)
})

const isOwner = computed(() => group.value?.pivot?.role === 'owner')

const tabs = computed(() => [
  { key: 'dashboard', label: t('groupDetail.tabs.dashboard'), icon: 'dashboard', component: DashboardTab },
  { key: 'expenses', label: t('groupDetail.tabs.expenses'), icon: 'receipt_long', component: ExpensesTab },
  { key: 'payments', label: t('groupDetail.tabs.payments'), icon: 'payments', component: PaymentsTab },
  { key: 'settle', label: t('groupDetail.tabs.settle'), icon: 'handshake', component: SettleTab },
  { key: 'chat', label: t('groupDetail.tabs.chat'), icon: 'chat', component: ChatTab },
  { key: 'members', label: t('groupDetail.tabs.members'), icon: 'group', component: MembersTab },
  ...(isOwner.value
    ? [
        { key: 'invitations', label: t('groupDetail.tabs.invitations'), icon: 'mark_email_unread', component: InvitationsTab },
        { key: 'settings', label: t('groupDetail.tabs.settings'), icon: 'settings', component: SettingsTab },
      ]
    : []),
])

const currentComponent = computed(() =>
  tabs.value.find((t) => t.key === activeTab.value)?.component
)

async function leaveGroup() {
  const { isConfirmed } = await Swal.fire({
    title: t('groupDetail.dialogs.leave.title'),
    text: t('groupDetail.dialogs.leave.text'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: t('groupDetail.dialogs.leave.confirm'),
    cancelButtonText: t('groupDetail.dialogs.leave.cancel'),
    confirmButtonColor: '#ef4444',
  })
  if (!isConfirmed) return
  try {
    await api.patch(`/api/v1/groups/${groupId}/leave`)
    await router.push({ name: 'groups' })
  } catch (err) {
    Swal.fire({
      title: t('groupDetail.dialogs.leave.cannotLeave'),
      text: err.response?.data?.message ?? t('groupDetail.dialogs.leave.error'),
      icon: 'error',
      confirmButtonColor: '#16647a',
    })
  }
}

async function fetchData() {
  try {
    const [groupRes, statsRes, expensesRes, balanceRes] = await Promise.all([
      api.get(`/api/v1/groups/${groupId}`),
      api.get(`/api/v1/groups/${groupId}/statistics`),
      api.get(`/api/v1/groups/${groupId}/expenses`, { params: { per_page: 4 } }),
      api.get(`/api/v1/groups/${groupId}/balance`),
    ])
    group.value = groupRes.data.data
    stats.value = statsRes.data.data
    expenses.value = expensesRes.data.data.data
    balance.value = balanceRes.data.data
  } catch {
    error.value = t('groupDetail.error')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="h-screen bg-brand-background flex overflow-hidden" style="font-family: 'Plus Jakarta Sans', sans-serif">
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
            {{ t('groupDetail.back') }}
          </span>
        </button>

        <!-- Group avatar + name -->
        <div class="flex items-center gap-3 h-12 px-5">
          <div class="w-8 h-8 rounded-lg bg-cerulean-100 shrink-0 overflow-hidden">
            <img
              v-if="group?.avatar?.url ?? group?.avatar"
              :src="group.avatar?.url ?? group.avatar"
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

      <!-- Notifications -->
      <div class="px-2 pb-1">
        <NotificationBell />
      </div>

      <!-- Leave Group (non-owners only) -->
      <button
        v-if="!isOwner"
        @click="leaveGroup"
        class="flex items-center gap-3 h-10 px-5 py-4 text-red-500 hover:text-red-600 transition-colors"
      >
        <span class="material-symbols-outlined text-[20px] shrink-0">logout</span>
        <span
          class="text-sm font-semibold whitespace-nowrap overflow-hidden max-w-0 group-hover/sb:max-w-48 transition-[max-width] duration-200"
        >
          {{ t('groupDetail.leaveGroup') }}
        </span>
      </button>
    </aside>

    <!-- Main -->
    <div class="flex-1 pl-16 sm:pl-20 flex flex-col min-h-0">
      <div
        class="flex-1 min-h-0"
        :class="activeTab === 'chat' && !loading && !error
          ? 'overflow-hidden'
          : 'overflow-y-auto px-4 sm:px-8 md:px-12 py-4 sm:py-8'"
      >
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
          :expenses="expenses"
          :balance="balance"
          :group-id="groupId"
          :is-owner="isOwner"
          @ownership-transferred="fetchGroup"
          @settled="fetchData"
        />
      </div>
    </div>

    <!-- Floating Add Expense Button -->
    <button
      v-if="!loading && !error && activeTab !== 'chat'"
      @click="showExpenseForm = true"
      class="fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full flex items-center justify-center text-white cursor-pointer shadow-[0_4px_20px_rgba(22,100,122,0.25)] hover:scale-105 active:scale-95 transition-transform"
      style="background-color: #41778b"
    >
      <span class="material-symbols-outlined text-[28px]">add</span>
    </button>

    <!-- Expense Form Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showExpenseForm"
          class="fixed inset-0 z-100 flex items-end sm:items-start justify-center"
          @click.self="showExpenseForm = false"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-cerulean-900/30 backdrop-blur-sm" @click="showExpenseForm = false" />

          <!-- Panel -->
          <div
            class="relative z-10 w-full sm:max-w-lg bg-brand-background rounded-t-3xl sm:rounded-2xl shadow-[0_8px_40px_rgba(22,100,122,0.12)] overflow-y-auto sm:my-8 sm:mx-4"
            style="max-height: 92dvh"
          >
            <div class="px-6 py-6">
              <AddExpenseForm
                :group-id="groupId"
                @created="showExpenseForm = false; fetchData()"
                @cancel="showExpenseForm = false"
              />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>