<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import logo from '@/assets/logo.svg'

defineProps({
  activeTab: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['change-tab'])

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()

const menu = computed(() => [
  { key: 'overview', label: t('admin.sidebar.overview'), icon: 'dashboard' },
  { key: 'categories', label: t('admin.sidebar.categories'), icon: 'category' },
  { key: 'groups', label: t('admin.sidebar.groups'), icon: 'groups' },
  { key: 'users', label: t('admin.sidebar.users'), icon: 'person' },
  { key: 'contacts', label: t('admin.sidebar.messages'), icon: 'mail' },
])

function selectTab(key) {
  emit('change-tab', key)
}

async function handleLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <aside
    class="w-65 sticky top-0 h-screen py-7 px-4 flex flex-col gap-7 z-10"
    style="
      background: rgba(244, 248, 249, 0.8);
      backdrop-filter: blur(18px) saturate(140%);
      -webkit-backdrop-filter: blur(18px) saturate(140%);
    "
  >
    <!-- Brand -->
    <div class="flex items-center gap-3 px-2.5 pt-1">
      <img
        :src="logo"
        alt="Nass Split"
        class="w-10 h-10 rounded-xl object-contain"
        style="box-shadow: 0 1px 2px rgba(22, 100, 122, 0.06), 0 2px 8px rgba(22, 100, 122, 0.04)"
      />
      <div class="flex flex-col">
        <span class="text-brand-text font-extrabold text-[17px] tracking-tight">
          Nass Split
        </span>
        <span
          class="text-brand-disabled text-[11px] font-medium uppercase tracking-[0.08em] -mt-0.5"
        >
          {{ t('admin.sidebar.ledgerAdmin') }}
        </span>
      </div>
    </div>

    <!-- Nav -->
    <nav class="flex-1 flex flex-col gap-0.5">
      <div
        class="text-brand-disabled text-[10.5px] font-semibold uppercase tracking-[0.14em] pt-2.5 px-3.5 pb-1.5"
      >
        {{ t('admin.sidebar.workspace') }}
      </div>
      <button
        v-for="item in menu"
        :key="item.key"
        type="button"
        @click="selectTab(item.key)"
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] text-left transition-colors"
        :class="
          activeTab === item.key
            ? 'bg-white text-brand-primary font-semibold'
            : 'text-brand-textSecondary font-medium hover:bg-brand-surface/40'
        "
        :style="
          activeTab === item.key
            ? 'box-shadow: 0 1px 2px rgba(22,100,122,0.06), 0 2px 8px rgba(22,100,122,0.04)'
            : ''
        "
      >
        <span class="material-symbols-outlined text-[18px]">{{ item.icon }}</span>
        {{ item.label }}
      </button>
    </nav>

    <!-- Footer card -->
    <div class="flex flex-col gap-3">
      <button
        type="button"
        @click="router.push({ name: 'profile' })"
        class="flex items-center gap-3 p-3.5 rounded-2xl bg-white w-full text-left group hover:bg-brand-background transition-colors"
        style="box-shadow: 0 1px 2px rgba(22, 100, 122, 0.06), 0 2px 8px rgba(22, 100, 122, 0.04)"
      >
        <div class="w-9 h-9 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-[13px] shrink-0 overflow-hidden">
          <img
            v-if="auth.user?.avatar?.url"
            :src="auth.user.avatar.url"
            :alt="auth.user.name"
            class="w-full h-full object-cover"
          />
          <span v-else>{{ auth.user?.name?.[0]?.toUpperCase() ?? 'A' }}</span>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-brand-text font-bold text-[13px] truncate">
            {{ auth.user?.name ?? 'Admin' }}
          </p>
          <p class="text-brand-disabled text-[11.5px] truncate">
            {{ auth.user?.email ?? '' }}
          </p>
        </div>
        <span
          class="material-symbols-outlined text-[16px] text-brand-disabled group-hover:text-brand-primary transition-colors shrink-0"
        >
          edit
        </span>
      </button>

      <button
        type="button"
        @click="handleLogout"
        class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white text-brand-textSecondary hover:text-brand-primary text-[13px] font-semibold transition-colors"
        style="box-shadow: 0 1px 2px rgba(22, 100, 122, 0.06), 0 2px 8px rgba(22, 100, 122, 0.04)"
      >
        <span class="material-symbols-outlined text-[16px]">logout</span>
        {{ t('admin.sidebar.logout') }}
      </button>
    </div>
  </aside>
</template>
