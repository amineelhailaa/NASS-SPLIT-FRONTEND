<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/lib/axios'
import Swal from 'sweetalert2'

const { t } = useI18n()

const filterOptions = computed(() => [
  { key: 'all', label: t('admin.contacts.filter.all') },
  { key: 'pending', label: t('admin.contacts.filter.pending') },
  { key: 'treated', label: t('admin.contacts.filter.treated') },
])

const messages = ref([])
const meta     = ref({})
const loading  = ref(false)
const filter   = ref('all')
const page     = ref(1)
const popup    = ref(null)

async function load() {
  loading.value = true
  try {
    const params = { page: page.value }
    if (filter.value !== 'all') params.status = filter.value
    const { data } = await api.get('/api/v1/contact-messages', { params })
    messages.value = data.data.data ?? []
    meta.value     = data.data.meta  ?? {}
  } finally {
    loading.value = false
  }
}

watch(filter, () => { page.value = 1; load() })
watch(page, load)
onMounted(load)

async function toggleStatus(msg) {
  const next = msg.status === 'pending' ? 'treated' : 'pending'
  await api.patch(`/api/v1/contact-messages/${msg.id}/status`, { status: next })
  popup.value = null
  await load()
}

async function destroy(msg) {
  const result = await Swal.fire({
    title: t('admin.contacts.dialogs.delete.title'),
    text: t('admin.contacts.dialogs.delete.text'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: t('admin.contacts.dialogs.delete.confirm'),
    cancelButtonText: t('admin.contacts.dialogs.delete.cancel'),
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#41778b',
  })
  if (!result.isConfirmed) return
  await api.delete(`/api/v1/contact-messages/${msg.id}`)
  popup.value = null
  await load()
}

function fmt(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="flex flex-col gap-7">

    <!-- Page head -->
    <div class="flex flex-col gap-2 pt-5">
      <span class="text-brand-primary font-semibold text-[12px] uppercase tracking-[0.14em]">{{ t('admin.contacts.breadcrumb') }}</span>
      <h1 class="text-brand-text font-extrabold text-[38px] leading-[1.05] tracking-[-0.03em] m-0">{{ t('admin.contacts.title') }}</h1>
      <p class="text-brand-textSecondary text-sm pt-1">{{ t('admin.contacts.subtitle') }}</p>
    </div>

    <!-- Filter pills -->
    <div class="flex items-center gap-2">
      <button
        v-for="opt in filterOptions"
        :key="opt.key"
        type="button"
        @click="filter = opt.key"
        class="px-5 py-2 rounded-2xl text-[13px] font-semibold transition-colors"
        :class="filter === opt.key
          ? 'bg-brand-primary text-white'
          : 'bg-white text-brand-textSecondary hover:bg-brand-background'"
        style="box-shadow: 0 1px 2px rgba(22,100,122,0.06), 0 2px 8px rgba(22,100,122,0.04)"
      >{{ opt.label }}</button>
    </div>

    <!-- Table card -->
    <div class="bg-white rounded-3xl overflow-hidden" style="box-shadow: 0 1px 2px rgba(22,100,122,0.06), 0 2px 8px rgba(22,100,122,0.04)">

      <div v-if="loading" class="flex items-center justify-center py-20 gap-2 text-brand-disabled text-sm">
        <span class="material-symbols-outlined animate-spin text-xl">progress_activity</span>
        {{ t('admin.contacts.loading') }}
      </div>

      <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center py-20 gap-3">
        <span class="material-symbols-outlined text-4xl text-brand-disabled">inbox</span>
        <p class="text-brand-textSecondary text-sm">{{ t('admin.contacts.empty') }}</p>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="px-6 py-3 grid grid-cols-[1fr_1.5fr_2fr_110px_56px] gap-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-disabled">
          <span>{{ t('admin.contacts.table.colName') }}</span><span>{{ t('admin.contacts.table.colEmail') }}</span><span>{{ t('admin.contacts.table.colSubject') }}</span><span>{{ t('admin.contacts.table.colDate') }}</span><span>{{ t('admin.contacts.table.colStatus') }}</span>
        </div>

        <!-- Rows -->
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="px-6 py-4 grid grid-cols-[1fr_1.5fr_2fr_110px_56px] gap-4 items-center cursor-pointer hover:bg-brand-background transition-colors"
          @click="popup = msg"
        >
          <span class="text-[13.5px] font-semibold text-brand-text truncate">{{ msg.name }}</span>
          <span class="text-[13px] text-brand-textSecondary truncate">{{ msg.email }}</span>
          <span class="text-[13px] text-brand-text truncate">{{ msg.subject }}</span>
          <span class="text-[12.5px] text-brand-disabled">{{ fmt(msg.created_at) }}</span>

          <!-- Status icon — click to toggle, stop row click -->
          <div class="flex items-center" @click.stop="toggleStatus(msg)">
            <div
              :title="msg.status === 'pending' ? t('admin.contacts.status.markTreatedTitle') : t('admin.contacts.status.markPendingTitle')"
              class="w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110"
              :class="msg.status === 'treated' ? 'bg-brand-primary' : 'border-2 border-brand-primary bg-white'"
            >
              <span class="material-symbols-outlined text-[15px]"
                :class="msg.status === 'treated' ? 'text-white' : 'text-brand-primary'"
              >{{ msg.status === 'treated' ? 'check' : 'schedule' }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Pagination -->
    <div v-if="meta.last_page > 1" class="flex items-center justify-between">
      <span class="text-[12.5px] text-brand-disabled">{{ t('admin.contacts.pageOf', { current: meta.current_page, last: meta.last_page }) }}</span>
      <div class="flex items-center gap-2">
        <button type="button" :disabled="page <= 1" @click="page--"
          class="w-9 h-9 rounded-xl flex items-center justify-center bg-white text-brand-textSecondary hover:text-brand-primary disabled:opacity-40 disabled:cursor-not-allowed"
          style="box-shadow: 0 1px 2px rgba(22,100,122,0.06)">
          <span class="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        <button type="button" :disabled="page >= meta.last_page" @click="page++"
          class="w-9 h-9 rounded-xl flex items-center justify-center bg-white text-brand-textSecondary hover:text-brand-primary disabled:opacity-40 disabled:cursor-not-allowed"
          style="box-shadow: 0 1px 2px rgba(22,100,122,0.06)">
          <span class="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Popup modal — email style -->
  <div
    v-if="popup"
    class="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm"
    @click.self="popup = null"
  >
    <div class="bg-white rounded-3xl w-full max-w-xl overflow-hidden flex flex-col" style="box-shadow: 0 12px 60px rgba(22,100,122,0.16)">

      <!-- Email toolbar -->
      <div class="flex items-center justify-between px-6 py-4 bg-brand-background">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-brand-primary text-[19px]">mail</span>
          <span class="text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-primary">{{ t('admin.contacts.popup.inboxMessage') }}</span>
        </div>
        <button type="button" @click="popup = null"
          class="w-8 h-8 rounded-full flex items-center justify-center text-brand-textSecondary hover:text-brand-primary hover:bg-white transition-colors">
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <!-- Subject line -->
      <div class="px-6 pt-5 pb-4">
        <h3 class="text-[22px] font-extrabold text-brand-text leading-tight tracking-tight">{{ popup.subject }}</h3>
      </div>

      <!-- From / meta row -->
      <div class="px-6 pb-5 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-[15px] shrink-0">
          {{ popup.name?.[0]?.toUpperCase() ?? '?' }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[13.5px] font-bold text-brand-text">{{ popup.name }}</p>
          <p class="text-[12px] text-brand-textSecondary">{{ popup.email }}</p>
        </div>
        <div class="flex flex-col items-end gap-1.5 shrink-0">
          <span class="text-[11.5px] text-brand-disabled">{{ fmt(popup.created_at) }}</span>
          <!-- Status badge -->
          <div
            class="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-bold"
            :class="popup.status === 'treated' ? 'bg-brand-primary text-white' : 'border-2 border-brand-primary text-brand-primary'"
          >
            <div class="w-1.5 h-1.5 rounded-full" :class="popup.status === 'treated' ? 'bg-white' : 'bg-brand-primary'"></div>
            {{ popup.status === 'treated' ? t('admin.contacts.status.treated') : t('admin.contacts.status.pending') }}
          </div>
        </div>
      </div>

      <!-- Divider line -->
      <div class="mx-6 h-px bg-brand-background"></div>

      <!-- Message body -->
      <div class="px-6 py-6 min-h-35">
        <p class="text-[14px] text-brand-text leading-relaxed whitespace-pre-wrap">{{ popup.message }}</p>
      </div>

      <!-- Divider line -->
      <div class="mx-6 h-px bg-brand-background"></div>

      <!-- Action bar -->
      <div class="px-6 py-4 flex items-center gap-3">
        <button type="button" @click="toggleStatus(popup)"
          class="flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-bold transition-all hover:scale-[1.02] active:scale-95"
          :class="popup.status === 'pending' ? 'bg-brand-primary text-white' : 'bg-brand-background text-brand-textSecondary hover:text-brand-primary'">
          <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            :class="popup.status === 'pending' ? 'bg-white/20' : 'border border-brand-primary'">
            <span class="material-symbols-outlined text-[13px]"
              :class="popup.status === 'pending' ? 'text-white' : 'text-brand-primary'">
              {{ popup.status === 'pending' ? 'check' : 'schedule' }}
            </span>
          </div>
          {{ popup.status === 'pending' ? t('admin.contacts.status.markAsTreated') : t('admin.contacts.status.markAsPending') }}
        </button>
        <button type="button" @click="destroy(popup)"
          class="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors">
          <span class="material-symbols-outlined text-[17px]">delete</span>
          {{ t('admin.contacts.popup.delete') }}
        </button>
      </div>
    </div>
  </div>
</template>