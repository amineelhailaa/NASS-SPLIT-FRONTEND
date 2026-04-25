<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/lib/axios'
import Swal from 'sweetalert2'

const users = ref([])
const loading = ref(false)
const search = ref('')
const page = ref(1)
const lastPage = ref(1)
const total = ref(0)

const { t } = useI18n()

const flash = ref(null)
let flashTimer = null
function showFlash(message) {
  flash.value = message
  clearTimeout(flashTimer)
  flashTimer = setTimeout(() => (flash.value = null), 3000)
}

let searchTimeout = null

async function loadUsers() {
  loading.value = true
  try {
    const response = await api.get('/api/v1/users', {
      params: {
        search: search.value,
        page: page.value,
      },
    })
    users.value = response.data.data.data
    lastPage.value = response.data.data.last_page
    total.value = response.data.data.total
  } catch (error) {
    console.error('Failed to load users', error)
  } finally {
    loading.value = false
  }
}

function goToPage(n) {
  page.value = n
  loadUsers()
}

watch(search, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  page.value = 1
  searchTimeout = setTimeout(loadUsers, 400)
})

async function banUser(id) {
  const { isConfirmed } = await Swal.fire({
    title: t('admin.users.dialogs.ban.title'),
    text: t('admin.users.dialogs.ban.text'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: t('admin.users.dialogs.ban.confirm'),
    cancelButtonText: t('admin.users.dialogs.ban.cancel'),
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#16647a',
  })
  if (!isConfirmed) return
  try {
    await api.patch(`/api/v1/users/${id}/ban`)
    await loadUsers()
    showFlash(t('admin.users.flash.banned'))
  } catch (error) {
    console.error('Failed to ban user', error)
  }
}

async function unbanUser(id) {
  const { isConfirmed } = await Swal.fire({
    title: t('admin.users.dialogs.unban.title'),
    text: t('admin.users.dialogs.unban.text'),
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: t('admin.users.dialogs.unban.confirm'),
    cancelButtonText: t('admin.users.dialogs.unban.cancel'),
    confirmButtonColor: '#16647a',
    cancelButtonColor: '#97bfce',
  })
  if (!isConfirmed) return
  try {
    await api.patch(`/api/v1/users/${id}/unban`)
    await loadUsers()
    showFlash(t('admin.users.flash.unbanned'))
  } catch (error) {
    console.error('Failed to unban user', error)
  }
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

onMounted(loadUsers)
</script>

<template>
  <div class="flex flex-col gap-7">
    <!-- Page head -->
    <div class="flex flex-col gap-2 pt-5">
      <span
        class="text-brand-primary font-semibold text-[12px] uppercase tracking-[0.14em]"
      >
        {{ t('admin.users.breadcrumb') }}
      </span>
      <h1
        class="text-brand-text font-extrabold text-[38px] leading-[1.05] tracking-[-0.03em] m-0"
      >
        {{ t('admin.users.title') }}
      </h1>
      <p class="text-brand-textSecondary text-sm pt-1">
        {{ t('admin.users.subtitle') }}
      </p>
    </div>

    <!-- Flash -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition-all duration-200 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="flash"
        class="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white text-brand-primary text-[13px] font-semibold"
        style="box-shadow: 0 1px 2px rgba(22, 100, 122, 0.06), 0 2px 8px rgba(22, 100, 122, 0.04)"
      >
        <span class="material-symbols-outlined text-[18px]">check_circle</span>
        {{ flash }}
      </div>
    </transition>

    <!-- Users Table -->
    <div
      class="bg-white rounded-3xl overflow-hidden"
      style="box-shadow: 0 1px 2px rgba(22, 100, 122, 0.06), 0 2px 8px rgba(22, 100, 122, 0.04)"
    >
      <div
        class="flex items-center justify-between gap-4 px-6 pt-5 pb-4 flex-wrap"
      >
        <div class="flex flex-col gap-1">
          <p
            class="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-disabled"
          >
            {{ t('admin.users.table.label') }}
          </p>
          <h3
            class="text-[18px] font-bold text-brand-text tracking-[-0.02em] leading-tight"
          >
            {{ t('admin.users.table.title') }}
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
              :placeholder="t('admin.users.table.searchPlaceholder')"
              class="w-72 pl-10 pr-4 py-2 bg-brand-background rounded-full text-[13px] text-brand-text placeholder:text-brand-disabled outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <span
            class="px-2.5 py-0.5 rounded-full font-semibold text-[11.5px] bg-brand-background text-brand-textSecondary"
          >
            {{ t('admin.users.table.total', { total }) }}
          </span>
        </div>
      </div>

      <div v-if="loading" class="text-brand-textSecondary py-10 text-center text-sm">
        {{ t('admin.users.table.loading') }}
      </div>
      <div
        v-else-if="users.length === 0"
        class="text-brand-textSecondary py-10 text-center text-sm"
      >
        {{ t('admin.users.table.empty') }}
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-[13px]">
          <thead>
            <tr class="bg-brand-background text-left">
              <th
                class="px-6 py-2.5 font-semibold text-[10.5px] uppercase tracking-[0.14em] text-brand-disabled"
              >
                {{ t('admin.users.table.colId') }}
              </th>
              <th
                class="px-6 py-2.5 font-semibold text-[10.5px] uppercase tracking-[0.14em] text-brand-disabled"
              >
                {{ t('admin.users.table.colUser') }}
              </th>
              <th
                class="px-6 py-2.5 font-semibold text-[10.5px] uppercase tracking-[0.14em] text-brand-disabled"
              >
                {{ t('admin.users.table.colEmail') }}
              </th>
              <th
                class="px-6 py-2.5 font-semibold text-[10.5px] uppercase tracking-[0.14em] text-brand-disabled"
              >
                {{ t('admin.users.table.colRole') }}
              </th>
              <th
                class="px-6 py-2.5 font-semibold text-[10.5px] uppercase tracking-[0.14em] text-brand-disabled"
              >
                {{ t('admin.users.table.colStatus') }}
              </th>
              <th
                class="px-6 py-2.5 font-semibold text-[10.5px] uppercase tracking-[0.14em] text-brand-disabled"
              >
                {{ t('admin.users.table.colJoined') }}
              </th>
              <th
                class="px-6 py-2.5 font-semibold text-[10.5px] uppercase tracking-[0.14em] text-brand-disabled text-right"
              >
                {{ t('admin.users.table.colActions') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in users"
              :key="user.id"
              class="shadow-[inset_0_1px_0] shadow-brand-background hover:bg-brand-background/40 transition-colors"
            >
              <td class="px-6 py-3.5 text-brand-textSecondary font-mono text-[12.5px]">
                #{{ user.id }}
              </td>
              <td class="px-6 py-3.5">
                <div class="flex items-center gap-3">
                  <img
                    v-if="user.avatar?.url"
                    :src="user.avatar.url"
                    :alt="user.name"
                    class="w-9 h-9 rounded-xl object-cover"
                  />
                  <div
                    v-else
                    class="w-9 h-9 rounded-xl bg-brand-background text-brand-primary flex items-center justify-center font-bold text-[13px]"
                  >
                    {{ user.name?.[0]?.toUpperCase() ?? '?' }}
                  </div>
                  <span class="text-brand-text font-semibold">{{ user.name }}</span>
                </div>
              </td>
              <td class="px-6 py-3.5 text-brand-textSecondary">
                {{ user.email }}
              </td>
              <td class="px-6 py-3.5">
                <span
                  class="px-2.5 py-0.5 rounded-full font-semibold text-[11.5px] bg-brand-background text-brand-primaryHover"
                >
                  {{ user.role ?? 'user' }}
                </span>
              </td>
              <td class="px-6 py-3.5">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-[11.5px]"
                  :class="
                    user.ban
                      ? 'bg-red-50 text-red-600'
                      : 'bg-brand-background text-brand-primary'
                  "
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="user.ban ? 'bg-red-500' : 'bg-brand-primary'"
                  ></span>
                  {{ user.ban ? t('admin.users.table.banned') : t('admin.users.table.active') }}
                </span>
              </td>
              <td class="px-6 py-3.5 text-brand-textSecondary">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="px-6 py-3.5">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    v-if="!user.ban"
                    type="button"
                    @click="banUser(user.id)"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-[11.5px] bg-brand-background hover:bg-red-50 text-brand-textSecondary hover:text-red-600 transition-colors"
                  >
                    <span class="material-symbols-outlined text-[15px]">block</span>
                    {{ t('admin.users.table.ban') }}
                  </button>
                  <button
                    v-else
                    type="button"
                    @click="unbanUser(user.id)"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-[11.5px] bg-brand-background hover:bg-brand-surface text-brand-textSecondary hover:text-brand-primary transition-colors"
                  >
                    <span class="material-symbols-outlined text-[15px]">
                      check_circle
                    </span>
                    {{ t('admin.users.table.unban') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="lastPage > 1"
        class="flex items-center justify-between px-6 py-4 bg-brand-background gap-3 flex-wrap"
      >
        <span class="text-[12px] text-brand-textSecondary">
          {{ t('admin.users.table.pageOf', { page, last: lastPage }) }}
        </span>
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
            :style="
              page === pageNum
                ? ''
                : 'box-shadow: 0 1px 2px rgba(22, 100, 122, 0.06)'
            "
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
