<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import NavBar from '@/components/NavBar.vue'
import AppFooter from '@/components/AppFooter.vue'
import GroupCard from '@/components/GroupCard.vue'
import NewGroup from '@/components/NewGroup.vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/lib/axios'

const { t } = useI18n()
const auth = useAuthStore()

const search = ref('')
const sortBy = ref('created_at')
const sortDir = ref('desc')
const page = ref(1)
const groups = ref([])
const pagination = ref(null)
const loading = ref(false)
const dropdownOpen = ref(false)
const showModal = ref(false)
let searchTimeout

async function fetchGroups() {
  const timer = setTimeout(() => { loading.value = true }, 300)
  try {
    const response = await api.get('/api/v1/groups', {
      params: {
        search: search.value,
        sort_by: sortBy.value,
        sort_dir: sortDir.value,
        page: page.value,
      },
    })
    groups.value = response.data.data.data
    pagination.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch groups:', error)
  } finally {
    clearTimeout(timer)
    loading.value = false
  }
}

function watchSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  page.value = 1
  searchTimeout = setTimeout(() => {
    fetchGroups()
  }, 400)
}

watch(search, watchSearch)

watch(sortBy, () => {
  page.value = 1
  fetchGroups()
})

watch(sortDir, () => {
  page.value = 1
  fetchGroups()
})

onMounted(() => {
  fetchGroups()
})

function toggleSortDir() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}

function goToPage(n) {
  page.value = n
  fetchGroups()
}

function onGroupCreated() {
  showModal.value = false
  page.value = 1
  fetchGroups()
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-brand-background" style="font-family: 'Plus Jakarta Sans', sans-serif">
    <NavBar />

    <main class="grow pt-32 pb-20 px-6 md:px-12">

      <!-- Page Header -->
      <section class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-10">
        <div>
          <h1 class="text-brand-text text-4xl md:text-5xl font-extrabold tracking-tight ">{{ t('groups.title') }}</h1>
          <p class="text-brand-primary text-lg pt-6 ">
            {{ t('groups.welcome', { name: auth.user?.name ?? '', count: pagination?.total ?? 0 }) }}
          </p>
        </div>
        <button
          @click="showModal = true"
          class="bg-cerulean-500 from-brand-primary to-brand-accent text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-[0_4px_20px_rgba(65,119,139,0.25)] hover:opacity-90 transition-opacity"
        >
          <span class="material-symbols-outlined">add_circle</span>
          {{ t('groups.createNew') }}
        </button>
      </section>

      <!-- Search & Sort Controls -->
      <div class="flex flex-col md:flex-row md:items-center gap-4 pb-8">
        <!-- Search Input -->
        <div class="relative grow">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-brand-disabled text-[20px]">search</span>
          <input
            v-model="search"
            type="text"
            :placeholder="t('groups.search')"
            class="w-full w-max-10 pl-12 pr-5 py-3 bg-white rounded-full  focus:ring-2 focus:ring-brand-primary outline-none text-brand-text placeholder:text-brand-disabled transition-all"
          />
        </div>

        <!-- Sort By Dropdown -->
        <div class="relative">
          <button
            @click="dropdownOpen = !dropdownOpen"
            class="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold bg-white text-brand-textSecondary  hover:ring-brand-primary transition-all whitespace-nowrap"
          >
            {{ t('groups.sort') }} <span class="text-cerulean-500">{{ sortBy === 'name' ? t('groups.sortName') : t('groups.sortDate') }}</span>
            <span class="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
          </button>

          <div
            v-show="dropdownOpen"
            class="absolute top-full left-0 mt-2 w-48 bg-brand-surfaceContrast rounded-2xl shadow-[0_8px_32px_rgba(65,119,139,0.14)] py-2 z-50"
          >
            <button
              @click="() => { sortBy = 'name'; dropdownOpen = false }"
              class="w-full text-left px-5 py-2.5 text-sm font-medium transition-colors"
              :class="
                sortBy === 'name'
                  ? 'text-brand-primary font-bold bg-brand-surface'
                  : 'text-brand-textSecondary hover:bg-brand-surface'
              "
            >
              {{ t('groups.sortName') }}
            </button>
            <button
              @click="() => { sortBy = 'created_at'; dropdownOpen = false }"
              class="w-full text-left px-5 py-2.5 text-sm font-medium transition-colors"
              :class="
                sortBy === 'created_at'
                  ? 'text-brand-primary font-bold bg-brand-surface'
                  : 'text-brand-textSecondary hover:bg-brand-surface'
              "
            >
              {{ t('groups.sortDate') }}
            </button>
          </div>
        </div>

        <!-- Sort Direction Toggle -->
        <button
          @click="toggleSortDir()"
          class="flex items-center justify-center px-5 py-2 rounded-full bg-white   hover:ring-brand-primary transition-all"
          :title="sortDir === 'asc' ? t('groups.sortAsc') : t('groups.sortDesc')"
        >
          <span class="material-symbols-outlined text-[18px]">{{ sortDir === 'asc' ? 'north' : 'south' }}</span>
        </button>
      </div>

      <!-- Groups Grid -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        <div v-for="n in 3" :key="n" class="animate-pulse bg-brand-surface rounded-2xl h-64" />
      </div>

      <div v-else-if="groups.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        <GroupCard
          v-for="group in groups"
          :key="group.id"
          :id="group.id"
          :name="group.name"
          :category="group.category"
          :member-count="group.members_count"
          :url="group.avatar?.url"
          :role="group.pivot?.role"
          :status="group.pivot?.status"
        />
      </div>

      <!-- Empty state -->
      <div v-else class="flex flex-col items-center justify-center py-24 gap-4">
        <span class="material-symbols-outlined text-[64px] text-brand-disabled">search_off</span>
        <p class="text-brand-textSecondary font-semibold text-lg">{{ t('groups.empty') }}</p>
      </div>

      <!-- Pagination -->
      <div v-if="pagination && pagination.last_page > 1" class="flex items-center justify-center gap-2 pb-12">
        <button
          @click="goToPage(page - 1)"
          :disabled="page === 1"
          class="flex items-center justify-center w-10 h-10 rounded-full text-brand-text transition-all"
          :class="
            page === 1
              ? 'bg-brand-disabled text-brand-surface cursor-not-allowed'
              : 'bg-brand-surfaceContrast ring-1 ring-brand-border hover:ring-brand-primary'
          "
        >
          <span class="material-symbols-outlined text-[18px]">arrow_back</span>
        </button>

        <button
          v-for="pageNum in pagination.last_page"
          :key="pageNum"
          @click="goToPage(pageNum)"
          class="w-10 h-10 rounded-full font-bold text-sm transition-all"
          :class="
            page === pageNum
              ? 'bg-brand-primary text-white'
              : 'bg-brand-surfaceContrast text-brand-textSecondary ring-1 ring-brand-border hover:ring-brand-primary'
          "
        >
          {{ pageNum }}
        </button>

        <button
          @click="goToPage(page + 1)"
          :disabled="page === pagination.last_page"
          class="flex items-center justify-center w-10 h-10 rounded-full text-brand-text transition-all"
          :class="
            page === pagination.last_page
              ? 'bg-brand-disabled text-brand-surface cursor-not-allowed'
              : 'bg-brand-surfaceContrast ring-1 ring-brand-border hover:ring-brand-primary'
          "
        >
          <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>

      <!-- Balance Banner -->
      <section class="pt-16 bg-cerulean-500 rounded-2xl p-8 md:p-12 relative overflow-hidden shadow-[0_8px_40px_rgba(65,119,139,0.3)]">
        <div class="absolute top-0 right-0 -mr-16 -mt-16 size-72 bg-white/10 rounded-full blur-3xl" />
        <div class="absolute bottom-0 left-0 -ml-16 -mb-16 size-56 bg-black/10 rounded-full blur-3xl" />
        <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div class="text-white">
            <h2 class="text-3xl font-extrabold mb-3">{{ t('groups.balance.title') }}</h2>
            <p class="text-white/80 text-lg">
              {{ t('groups.balance.owed') }}
              <span class="text-white font-bold">-145.20 DH</span>
            </p>
          </div>
          <button
            class="border border-white/30 text-white px-8 py-3.5 rounded-full font-bold hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            {{ t('groups.balance.viewReport') }}
          </button>
        </div>
      </section>
    </main>

    <AppFooter />

    <!-- New Group Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center px-4"
        style="background: rgba(22,29,31,0.5); backdrop-filter: blur(4px)"
        @click.self="showModal = false"
      >
        <div class="bg-brand-surface rounded-3xl w-full max-w-lg p-8 relative" style="box-shadow: 0 8px 40px rgba(22,100,122,0.14)">
          <button
            @click="showModal = false"
            class="absolute top-5 right-5 text-brand-textSecondary hover:text-brand-text transition-colors cursor-pointer"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
          <NewGroup @created="onGroupCreated" />
        </div>
      </div>
    </Teleport>
  </div>
</template>
