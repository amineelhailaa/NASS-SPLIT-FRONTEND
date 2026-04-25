<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/lib/axios'

const { t } = useI18n()

const groups = ref([])
const loading = ref(false)
const search = ref('')
const page = ref(1)
const lastPage = ref(1)
const total = ref(0)

const expandedGroup = ref(null)

let searchTimeout = null

async function loadGroups() {
  loading.value = true
  try {
    const response = await api.get('/api/v1/groups', {
      params: { search: search.value, page: page.value },
    })
    groups.value = response.data.data.data
    lastPage.value = response.data.data.last_page
    total.value = response.data.data.total
  } catch (error) {
    console.error('Failed to load groups', error)
  } finally {
    loading.value = false
  }
}

function toggleGroup(groupId) {
  expandedGroup.value = expandedGroup.value === groupId ? null : groupId
}

function goToPage(n) {
  page.value = n
  expandedGroup.value = null
  loadGroups()
}

watch(search, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  page.value = 1
  expandedGroup.value = null
  searchTimeout = setTimeout(loadGroups, 400)
})

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

onMounted(loadGroups)
</script>

<template>
  <div class="flex flex-col gap-7">
    <!-- Page head -->
    <div class="flex flex-col gap-2 pt-5">
      <span class="text-brand-primary font-semibold text-[12px] uppercase tracking-[0.14em]">
        {{ t('admin.groups.breadcrumb') }}
      </span>
      <h1 class="text-brand-text font-extrabold text-[38px] leading-[1.05] tracking-[-0.03em] m-0">
        {{ t('admin.groups.title') }}
      </h1>
      <p class="text-brand-textSecondary text-sm pt-1">{{ t('admin.groups.subtitle') }}</p>
    </div>

    <!-- Groups Table -->
    <div
      class="bg-white rounded-3xl overflow-hidden"
      style="box-shadow: 0 1px 2px rgba(22, 100, 122, 0.06), 0 2px 8px rgba(22, 100, 122, 0.04)"
    >
      <div class="flex items-center justify-between gap-4 px-6 pt-5 pb-4 flex-wrap">
        <div class="flex flex-col gap-1">
          <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-disabled">
            {{ t('admin.groups.table.label') }}
          </p>
          <h3 class="text-[18px] font-bold text-brand-text tracking-[-0.02em] leading-tight">
            {{ t('admin.groups.table.title') }}
          </h3>
        </div>
        <div class="flex items-center gap-3">
          <div class="relative">
            <span
              class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-disabled text-[18px]"
            >
              search
            </span>
            <input
              v-model="search"
              type="text"
              :placeholder="t('admin.groups.table.searchPlaceholder')"
              class="w-72 pl-10 pr-4 py-2 bg-brand-background rounded-full text-[13px] text-brand-text placeholder:text-brand-disabled outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <span
            class="px-2.5 py-0.5 rounded-full font-semibold text-[11.5px] bg-brand-background text-brand-textSecondary"
          >
            {{ t('admin.groups.table.total', { total }) }}
          </span>
        </div>
      </div>

      <div v-if="loading" class="text-brand-textSecondary py-10 text-center text-sm">
        {{ t('admin.groups.table.loading') }}
      </div>
      <div
        v-else-if="groups.length === 0"
        class="text-brand-textSecondary py-10 text-center text-sm"
      >
        {{ t('admin.groups.table.empty') }}
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-[13px]">
          <thead>
            <tr class="bg-brand-background text-left">
              <th
                class="px-6 py-2.5 font-semibold text-[10.5px] uppercase tracking-[0.14em] text-brand-disabled w-8"
              ></th>
              <th
                class="px-6 py-2.5 font-semibold text-[10.5px] uppercase tracking-[0.14em] text-brand-disabled"
              >
                {{ t('admin.groups.table.colId') }}
              </th>
              <th
                class="px-6 py-2.5 font-semibold text-[10.5px] uppercase tracking-[0.14em] text-brand-disabled"
              >
                {{ t('admin.groups.table.colGroup') }}
              </th>
              <th
                class="px-6 py-2.5 font-semibold text-[10.5px] uppercase tracking-[0.14em] text-brand-disabled"
              >
                {{ t('admin.groups.table.colDescription') }}
              </th>
              <th
                class="px-6 py-2.5 font-semibold text-[10.5px] uppercase tracking-[0.14em] text-brand-disabled"
              >
                {{ t('admin.groups.table.colMembers') }}
              </th>
              <th
                class="px-6 py-2.5 font-semibold text-[10.5px] uppercase tracking-[0.14em] text-brand-disabled"
              >
                {{ t('admin.groups.table.colSettle') }}
              </th>
              <th
                class="px-6 py-2.5 font-semibold text-[10.5px] uppercase tracking-[0.14em] text-brand-disabled"
              >
                {{ t('admin.groups.table.colInvite') }}
              </th>
              <th
                class="px-6 py-2.5 font-semibold text-[10.5px] uppercase tracking-[0.14em] text-brand-disabled"
              >
                {{ t('admin.groups.table.colCreated') }}
              </th>
              <th
                class="px-6 py-2.5 font-semibold text-[10.5px] uppercase tracking-[0.14em] text-brand-disabled"
              >
                {{ t('admin.groups.table.colUpdated') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="group in groups" :key="group.id">
              <!-- Main row -->
              <tr
                class="shadow-[inset_0_1px_0] shadow-brand-background hover:bg-brand-background/40 transition-colors cursor-pointer"
                :class="expandedGroup === group.id ? 'bg-brand-background/40' : ''"
                @click="toggleGroup(group.id)"
              >
                <td class="px-4 py-3.5 text-center">
                  <span
                    class="material-symbols-outlined text-[16px] text-brand-disabled transition-transform duration-200"
                    :class="expandedGroup === group.id ? 'rotate-90' : ''"
                  >
                    chevron_right
                  </span>
                </td>
                <td class="px-6 py-3.5 text-brand-textSecondary font-mono text-[12.5px]">
                  #{{ group.id }}
                </td>
                <td class="px-6 py-3.5">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="group.avatar?.url"
                      :src="group.avatar.url"
                      :alt="group.name"
                      class="w-9 h-9 rounded-xl object-cover"
                    />
                    <div
                      v-else
                      class="w-9 h-9 rounded-xl bg-brand-background text-brand-primary flex items-center justify-center font-bold text-[13px]"
                    >
                      {{ group.name?.[0]?.toUpperCase() ?? '?' }}
                    </div>
                    <span class="text-brand-text font-semibold">{{ group.name }}</span>
                  </div>
                </td>
                <td class="px-6 py-3.5 text-brand-textSecondary max-w-xs truncate">
                  {{ group.description ?? '-' }}
                </td>
                <td class="px-6 py-3.5 text-brand-text font-semibold">
                  {{ group.members_count ?? 0 }}
                </td>
                <td class="px-6 py-3.5">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-[11.5px]"
                    :class="
                      group.settle
                        ? 'bg-brand-background text-brand-primary'
                        : 'bg-brand-background text-brand-disabled'
                    "
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      :class="group.settle ? 'bg-brand-primary' : 'bg-brand-disabled'"
                    ></span>
                    {{ group.settle ? t('admin.groups.table.settleOn') : t('admin.groups.table.settleOff') }}
                  </span>
                </td>
                <td class="px-6 py-3.5 text-brand-textSecondary font-mono text-[12px]">
                  {{ group.invitation_code ?? '-' }}
                </td>
                <td class="px-6 py-3.5 text-brand-textSecondary">
                  {{ formatDate(group.created_at) }}
                </td>
                <td class="px-6 py-3.5 text-brand-textSecondary">
                  {{ formatDate(group.updated_at) }}
                </td>
              </tr>

              <!-- Expanded members row -->
              <tr v-if="expandedGroup === group.id" class="bg-brand-background/60">
                <td colspan="9" class="px-8 py-5">
                  <div
                    v-if="!group.users?.length"
                    class="text-brand-disabled text-[12.5px]"
                  >
                    {{ t('admin.groups.table.noMembers') }}
                  </div>
                  <div v-else class="flex flex-wrap gap-4">
                    <div
                      v-for="user in group.users"
                      :key="user.id"
                      class="flex flex-col items-center gap-1.5"
                    >
                      <img
                        v-if="user.avatar?.url"
                        :src="user.avatar.url"
                        :alt="user.name"
                        class="w-10 h-10 rounded-full object-cover"
                        style="box-shadow: 0 1px 2px rgba(22,100,122,0.08)"
                      />
                      <div
                        v-else
                        class="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-[13px]"
                        style="box-shadow: 0 1px 2px rgba(22,100,122,0.08)"
                      >
                        {{ user.name?.[0]?.toUpperCase() ?? '?' }}
                      </div>
                      <span class="text-brand-text text-[11.5px] font-medium text-center max-w-[72px] truncate">
                        {{ user.name }}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="lastPage > 1"
        class="flex items-center justify-between px-6 py-4 bg-brand-background gap-3 flex-wrap"
      >
        <span class="text-[12px] text-brand-textSecondary">{{ t('admin.groups.table.pageOf', { page, last: lastPage }) }}</span>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            @click="goToPage(page - 1)"
            :disabled="page === 1"
            class="w-8 h-8 rounded-lg flex items-center justify-center bg-white text-brand-textSecondary hover:text-brand-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style="box-shadow: 0 1px 2px rgba(22, 100, 122, 0.06)"
          >
            <span class="material-symbols-outlined text-[16px]">arrow_back</span>
          </button>

          <button
            v-for="pageNum in lastPage"
            :key="pageNum"
            type="button"
            @click="goToPage(pageNum)"
            class="w-8 h-8 rounded-lg font-semibold text-[12px] transition-colors"
            :class="
              page === pageNum
                ? 'bg-brand-primary text-white'
                : 'bg-white text-brand-textSecondary hover:text-brand-primary'
            "
            :style="page === pageNum ? '' : 'box-shadow: 0 1px 2px rgba(22, 100, 122, 0.06)'"
          >
            {{ pageNum }}
          </button>

          <button
            type="button"
            @click="goToPage(page + 1)"
            :disabled="page === lastPage"
            class="w-8 h-8 rounded-lg flex items-center justify-center bg-white text-brand-textSecondary hover:text-brand-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style="box-shadow: 0 1px 2px rgba(22, 100, 122, 0.06)"
          >
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>