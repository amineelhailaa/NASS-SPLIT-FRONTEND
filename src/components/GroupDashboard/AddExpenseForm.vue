<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import Swal from 'sweetalert2'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import api from '@/lib/axios'
import InputError from '@/components/inputError.vue'

// Props & Emits
const props = defineProps({ groupId: [Number, String] })
const emit = defineEmits(['created', 'cancel'])

const { t } = useI18n()

// Reactive State
const members = ref([])
const categories = ref([])
const loadingData = ref(true)
const isSubmitting = ref(false)
const splitStrategy = ref('equal')
const submitError = ref('')
const payerDropdownOpen = ref(false)
const participants = ref([])

// Validation Schema
const schema = computed(() =>
  yup.object({
    title: yup.string().required(t('addExpense.errors.titleRequired')),
    amount: yup.number().required(t('addExpense.errors.amountRequired')).min(1, t('addExpense.errors.amountMin')).typeError(t('addExpense.errors.amountNumber')),
    date: yup.date().max(new Date(), 'Date cannot be in the future').required(),
    payer_id: yup.number().required(t('addExpense.errors.payerRequired')).typeError(t('addExpense.errors.payerSelect')),
    category_id: yup.number().nullable(),
  })
)

// Form Setup
const { handleSubmit, setErrors } = useForm({
  validationSchema: schema,
  initialValues: { date: new Date().toISOString().split('T')[0] },
})

const { value: title, errorMessage: titleError } = useField('title')
const { value: amount, errorMessage: amountError } = useField('amount')
const { value: date, errorMessage: dateError } = useField('date')
const { value: payer_id, errorMessage: payerError } = useField('payer_id')
const { value: category_id } = useField('category_id')

// Payer Dropdown
const payerRef = ref(null)
function handleClickOutside(e) {
  if (payerRef.value && !payerRef.value.contains(e.target)) payerDropdownOpen.value = false
}

// Computed Values
const activeMembers = computed(() => members.value.filter((m) => m.status === 'active'))
const selectedPayer = computed(() => members.value.find((m) => m.id === payer_id.value) ?? null)
const selectedParticipants = computed(() => participants.value.filter((p) => p.checked))
const selectedCount = computed(() => selectedParticipants.value.length)

const equalShare = computed(() => {
  if (!amount.value || selectedCount.value === 0) return 0
  return parseFloat((amount.value / selectedCount.value).toFixed(2))
})

const fixedTotal = computed(() =>
  selectedParticipants.value.reduce((sum, p) => sum + (parseFloat(p.fixedAmount) || 0), 0),
)
const fixedRemaining = computed(() =>
  parseFloat(((amount.value || 0) - fixedTotal.value).toFixed(2)),
)

const percentageTotal = computed(() =>
  selectedParticipants.value.reduce((sum, p) => sum + (parseFloat(p.percentage) || 0), 0),
)
const percentageRemaining = computed(() => parseFloat((100 - percentageTotal.value).toFixed(1)))

const splitValid = computed(() => {
  if (selectedCount.value === 0) return false
  if (splitStrategy.value === 'fixed') return Math.abs(fixedRemaining.value) < 0.01
  if (splitStrategy.value === 'percentage') return Math.abs(percentageRemaining.value) < 0.1
  return true
})

const strategies = computed(() => [
  { key: 'equal', label: t('addExpense.strategies.equal'), icon: 'drag_handle' },
  { key: 'fixed', label: t('addExpense.strategies.fixed'), icon: 'payments' },
  { key: 'percentage', label: t('addExpense.strategies.percentage'), icon: 'percent' },
])

// Lifecycle
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  loadingData.value = true
  try {
    const [membersRes, categoriesRes] = await Promise.all([
      api.get(`/api/v1/groups/${props.groupId}/members`, { params: { per_page: 100 } }),
      api.get('/api/v1/categories', { params: { per_page: 100 } }),
    ])

    members.value = membersRes.data.data.data ?? membersRes.data.data
    categories.value = categoriesRes.data.data.data ?? categoriesRes.data.data

    participants.value = activeMembers.value.map((m) => ({
      membership_id: m.id,
      checked: true,
      user: m.user,
      fixedAmount: '',
      percentage: 0,
    }))
  } catch {
    submitError.value = t('addExpense.errors.loadFailed')
  } finally {
    loadingData.value = false
  }
})

onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))

// Form Submission
const onSubmit = handleSubmit(async () => {
  if (selectedCount.value === 0) {
    submitError.value = t('addExpense.errors.noParticipant')
    return
  }
  if (splitStrategy.value === 'fixed' && Math.round(fixedTotal.value * 100) !== Math.round((amount.value || 0) * 100)) {
    submitError.value = t('addExpense.errors.fixedTotal')
    return
  }
  if (splitStrategy.value === 'percentage' && Math.abs(percentageTotal.value - 100) > 0.1) {
    submitError.value = t('addExpense.errors.pctTotal')
    return
  }

  submitError.value = ''
  isSubmitting.value = true
  try {
    const participantsPayload = selectedParticipants.value.map((p) => {
      const entry = { membership_id: p.membership_id }
      if (splitStrategy.value === 'fixed') entry.amount = parseFloat(p.fixedAmount) || 0
      if (splitStrategy.value === 'percentage') entry.percentage = parseFloat(p.percentage) || 0
      return entry
    })

    await api.post(`/api/v1/groups/${props.groupId}/expenses`, {
      title: title.value,
      amount: amount.value,
      date: date.value,
      payer_id: payer_id.value,
      category_id: category_id.value || null,
      split_strategy: splitStrategy.value,
      participants: participantsPayload,
    })

    Swal.fire({
      title: t('addExpense.successTitle'),
      text: t('addExpense.successText'),
      icon: 'success',
      confirmButtonColor: '#41778b',
      customClass: {
        popup: '!rounded-2xl',
        confirmButton: '!rounded-full !font-bold',
      },
      timer: 1800,
      showConfirmButton: false,
    })
    emit('created')
  } catch (err) {
    if (err.response?.status === 422) {
      const laravelErrors = {}
      for (const [field, messages] of Object.entries(err.response.data.errors ?? {})) {
        laravelErrors[field] = messages[0]
      }
      setErrors(laravelErrors)
      if (err.response.data.message) submitError.value = err.response.data.message
    } else {
      submitError.value = t('addExpense.errors.generic')
    }
  } finally {
    isSubmitting.value = false
  }
})

// Helpers
function toggleParticipant(idx) {
  participants.value[idx].checked = !participants.value[idx].checked
}

function selectPayer(member) {
  payer_id.value = member.id
  payerDropdownOpen.value = false
}

function formatCurrency(val) {
  return `${Number(val).toFixed(2)} DH`
}
</script>

<template>
  <div class="flex flex-col gap-6" style="font-family: 'Plus Jakarta Sans', sans-serif">
    <!-- Mobile drag handle -->
    <div class="sm:hidden flex justify-center -mt-2 -mb-2">
      <div class="w-10 h-1 rounded-full bg-cerulean-200" />
    </div>
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-extrabold text-cerulean-800">{{ t('addExpense.title') }}</h2>
      <button
        type="button"
        @click="emit('cancel')"
        class="w-10 h-10 rounded-full bg-cerulean-50 flex items-center justify-center text-brand-textSecondary hover:text-brand-text hover:bg-white transition-colors cursor-pointer"
      >
        <span class="material-symbols-outlined text-xl">close</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loadingData" class="flex flex-col gap-4">
      <div v-for="n in 5" :key="n" class="animate-pulse bg-brand-surface rounded-2xl h-14" />
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="onSubmit" class="flex flex-col gap-6">
      <!-- Error banner -->
      <div
        v-if="submitError"
        class="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2"
      >
        <span class="material-symbols-outlined text-[18px]">error</span>
        {{ submitError }}
      </div>

      <!-- Basic Details -->
      <div class="flex flex-col gap-4">
        <!-- Title -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-bold text-cerulean-800">{{ t('addExpense.fields.title') }}</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none">receipt</span>
            <input
              v-model="title"
              type="text"
              :placeholder="t('addExpense.fields.titlePlaceholder')"
              class="w-full bg-white text-cerulean-800 placeholder:text-cerulean-800/30 rounded-full pl-12 pr-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition"
              :class="{ 'ring-2 ring-red-400/50 bg-red-50': titleError }"
            />
          </div>
          <InputError :message="titleError" />
        </div>

        <!-- Amount + Date -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-cerulean-800">{{ t('addExpense.fields.amount') }}</label>
            <div class="relative">
              <span class=" absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xs font-bold pointer-events-none">DH</span>
              <input
                v-model.number="amount"
                type="number"
                step="0.01"
                min="1"
                placeholder="0.00"
                class="w-full bg-white text-cerulean-800 placeholder:text-cerulean-800/30 rounded-full pl-12 pr-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition"
                :class="{ 'ring-2 ring-red-400/50 bg-red-50': amountError }"
              />
            </div>
            <InputError :message="amountError" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-cerulean-800">{{ t('addExpense.fields.date') }}</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none">calendar_today</span>
              <input
                v-model="date"
                type="date"
                class="w-full bg-white text-cerulean-800 rounded-full pl-12 pr-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition"
                :class="{ 'ring-2 ring-red-400/50 bg-red-50': dateError }"
              />
            </div>
            <InputError :message="dateError" />
          </div>
        </div>

        <!-- Category + Payer -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-cerulean-800">
              {{ t('addExpense.fields.category') }} <span class="text-cerulean-800/40 font-normal">{{ t('addExpense.fields.categoryOptional') }}</span>
            </label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none">category</span>
              <select
                v-model="category_id"
                class="w-full bg-white text-cerulean-800 rounded-full pl-12 pr-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition appearance-none cursor-pointer"
              >
                <option :value="null">{{ t('addExpense.fields.noCategory') }}</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
              <span class="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-cerulean-400 text-lg pointer-events-none">expand_more</span>
            </div>
          </div>

          <!-- Payer (custom dropdown with avatars) -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-cerulean-800">{{ t('addExpense.fields.payer') }}</label>
            <div ref="payerRef" class="relative">
              <button
                type="button"
                @click="payerDropdownOpen = !payerDropdownOpen"
                class="w-full bg-white text-cerulean-800 rounded-full pl-4 pr-6 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition flex items-center gap-3 cursor-pointer text-left"
                :class="{ 'ring-2 ring-red-400/50 bg-red-50': payerError }"
              >
                <template v-if="selectedPayer">
                  <div class="w-8 h-8 rounded-full bg-cerulean-50 shrink-0 overflow-hidden flex items-center justify-center">
                    <img v-if="selectedPayer.user?.avatar?.url" :src="selectedPayer.user.avatar.url" :alt="selectedPayer.user?.name" class="w-full h-full object-cover" />
                    <span v-else class="material-symbols-outlined text-brand-primary text-[16px]">person</span>
                  </div>
                  <span class="text-sm font-semibold truncate">{{ selectedPayer.user?.name }}</span>
                </template>
                <template v-else>
                  <span class="material-symbols-outlined text-cerulean-500 text-xl shrink-0">person</span>
                  <span class="text-sm text-cerulean-800/30">{{ t('addExpense.fields.payerPlaceholder') }}</span>
                </template>
                <span
                  class="material-symbols-outlined ml-auto text-cerulean-400 text-lg shrink-0 transition-transform"
                  :class="{ 'rotate-180': payerDropdownOpen }"
                >expand_more</span>
              </button>

              <div
                v-if="payerDropdownOpen"
                class="absolute left-0 right-0 top-full z-20 bg-white rounded-2xl shadow-[0_8px_32px_rgba(22,100,122,0.12)] overflow-hidden py-1"
              >
                <button
                  v-for="m in activeMembers"
                  :key="m.id"
                  type="button"
                  @click="selectPayer(m)"
                  class="w-full flex items-center gap-3 px-4 py-3 hover:bg-cerulean-50 transition-colors cursor-pointer"
                  :class="{ 'bg-cerulean-50': payer_id === m.id }"
                >
                  <div class="w-8 h-8 rounded-full bg-cerulean-50 shrink-0 overflow-hidden flex items-center justify-center">
                    <img v-if="m.user?.avatar?.url" :src="m.user.avatar.url" :alt="m.user?.name" class="w-full h-full object-cover" />
                    <span v-else class="material-symbols-outlined text-brand-primary text-[16px]">person</span>
                  </div>
                  <span class="text-sm font-semibold text-cerulean-800 truncate">{{ m.user?.name }}</span>
                  <span v-if="payer_id === m.id" class="material-symbols-outlined ml-auto text-brand-primary text-lg">check</span>
                </button>
              </div>
            </div>
            <InputError :message="payerError" />
          </div>
        </div>
      </div>

      <!-- Split Strategy Tabs -->
      <div class="flex flex-col gap-3">
        <p class="text-sm font-bold text-cerulean-800">{{ t('addExpense.fields.split') }}</p>
        <div class="flex gap-2">
          <button
            v-for="s in strategies"
            :key="s.key"
            type="button"
            @click="splitStrategy = s.key"
            class="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            :class="splitStrategy === s.key
              ? 'bg-brand-primary text-white shadow-[0_2px_12px_rgba(22,100,122,0.15)]'
              : 'bg-cerulean-50 text-brand-textSecondary hover:bg-white'"
          >
            <span class="material-symbols-outlined text-lg">{{ s.icon }}</span>
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- Participants -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <p class="text-sm font-bold text-cerulean-800">{{ t('addExpense.fields.participants') }}</p>
          <span class="text-xs font-semibold text-brand-textSecondary">
            {{ t('addExpense.participantCount', { selected: selectedCount, total: participants.length }) }}
          </span>
        </div>

        <!-- Fixed allocation indicator -->
        <div v-if="splitStrategy === 'fixed' && amount" class="bg-cerulean-50 rounded-2xl px-5 py-4 flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-cerulean-800/60 uppercase tracking-wide">{{ t('addExpense.allocation.allocated') }}</span>
            <span
              class="text-sm font-extrabold"
              :class="Math.abs(fixedRemaining) < 0.01 ? 'text-emerald-600' : fixedRemaining < 0 ? 'text-red-500' : 'text-cerulean-700'"
            >
              {{ formatCurrency(fixedTotal) }} / {{ formatCurrency(amount) }}
            </span>
          </div>
          <div class="h-2 rounded-full bg-brand-surface overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="Math.abs(fixedRemaining) < 0.01 ? 'bg-emerald-500' : fixedRemaining < 0 ? 'bg-red-400' : 'bg-brand-primary'"
              :style="{ width: Math.min((fixedTotal / (amount || 1)) * 100, 100) + '%' }"
            />
          </div>
          <p v-if="Math.abs(fixedRemaining) >= 0.01" class="text-xs font-semibold" :class="fixedRemaining > 0 ? 'text-cerulean-600' : 'text-red-500'">
            {{ fixedRemaining > 0 ? t('addExpense.allocation.remaining', { fixed: formatCurrency(fixedRemaining) }) : t('addExpense.allocation.exceeded', { fixed: formatCurrency(Math.abs(fixedRemaining)) }) }}
          </p>
        </div>

        <!-- Percentage allocation indicator -->
        <div v-if="splitStrategy === 'percentage'" class="bg-cerulean-50 rounded-2xl px-5 py-4 flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-cerulean-800/60 uppercase tracking-wide">{{ t('addExpense.allocation.allocated') }}</span>
            <span
              class="text-sm font-extrabold"
              :class="Math.abs(percentageRemaining) < 0.1 ? 'text-emerald-600' : percentageRemaining < 0 ? 'text-red-500' : 'text-cerulean-700'"
            >
              {{ percentageTotal.toFixed(1) }}% / 100%
            </span>
          </div>
          <div class="h-2 rounded-full bg-brand-surface overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="Math.abs(percentageRemaining) < 0.1 ? 'bg-emerald-500' : percentageRemaining < 0 ? 'bg-red-400' : 'bg-brand-primary'"
              :style="{ width: Math.min(percentageTotal, 100) + '%' }"
            />
          </div>
          <p v-if="Math.abs(percentageRemaining) >= 0.1" class="text-xs font-semibold" :class="percentageRemaining > 0 ? 'text-cerulean-600' : 'text-red-500'">
            {{ percentageRemaining > 0 ? t('addExpense.allocation.pctRemaining', { pct: percentageRemaining.toFixed(1) }) : t('addExpense.allocation.pctExceeded', { pct: Math.abs(percentageRemaining).toFixed(1) }) }}
          </p>
        </div>

        <!-- Member cards -->
        <div class="flex flex-col gap-2">
          <div
            v-for="(p, idx) in participants"
            :key="p.membership_id"
            class="rounded-2xl px-4 py-3 flex items-center justify-between gap-3 transition-colors"
            :class="p.checked ? 'bg-white shadow-[0_2px_12px_rgba(22,100,122,0.06)]' : 'bg-cerulean-50/50'"
          >
            <div class="flex flex-row gap-2 flex-1 min-w-0 items-center">
              <button
                type="button"
                @click="toggleParticipant(idx)"
                class="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center transition-colors cursor-pointer"
                :class="p.checked ? 'bg-brand-primary text-white' : 'bg-white text-transparent hover:bg-cerulean-200'"
              >
                <span class="material-symbols-outlined text-[18px]">check</span>
              </button>
              <div class="w-9 h-9 rounded-full bg-cerulean-50 shrink-0 overflow-hidden flex items-center justify-center">
                <img v-if="p.user?.avatar?.url" :src="p.user.avatar.url" :alt="p.user?.name" class="w-full h-full object-cover" />
                <span v-else class="material-symbols-outlined text-brand-primary text-[18px]">person</span>
              </div>
              <span class="text-sm font-semibold truncate flex-1 min-w-0" :class="p.checked ? 'text-brand-text' : 'text-brand-disabled'">
                {{ p.user?.name }}
              </span>
            </div>

            <div class="shrink-0 text-right">
              <span
                v-if="splitStrategy === 'equal'"
                class="text-sm font-extrabold tabular-nums"
                :class="p.checked ? 'text-cerulean-700' : 'text-brand-disabled'"
              >
                {{ p.checked && amount ? formatCurrency(equalShare) : '—' }}
              </span>

              <div v-else-if="splitStrategy === 'fixed'" class="flex items-center gap-1">
                <span class="text-sm font-bold text-cerulean-500">DH</span>
                <input
                  v-model="p.fixedAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  :disabled="!p.checked"
                  class="w-20 bg-white text-cerulean-800 text-sm font-semibold text-right rounded-full px-3 py-2 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition tabular-nums disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>

              <div v-else-if="splitStrategy === 'percentage'" class="flex items-center gap-2">
                <input
                  v-model.number="p.percentage"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  :disabled="!p.checked"
                  class="percentage-slider w-20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                />
                <span class="text-sm font-extrabold tabular-nums w-10 text-right" :class="p.checked ? 'text-cerulean-700' : 'text-brand-disabled'">
                  {{ p.checked ? p.percentage : 0 }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <p v-if="!splitValid && selectedCount > 0 && amount" class="text-xs font-semibold text-amber-600 pl-1">
          <span class="material-symbols-outlined text-[14px] align-middle">info</span>
          {{ splitStrategy === 'fixed' ? t('addExpense.allocation.fixedHint') : t('addExpense.allocation.pctHint') }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          type="button"
          @click="emit('cancel')"
          class="flex-1 flex items-center justify-center gap-2 rounded-full py-4 text-sm font-bold text-cerulean-600 bg-cerulean-50 hover:bg-white transition-colors cursor-pointer"
        >
          {{ t('addExpense.cancel') }}
        </button>
        <button
          type="submit"
          :disabled="isSubmitting || (!splitValid && !!amount)"
          class="flex-1 flex items-center justify-center gap-2 rounded-full py-4 text-base font-bold text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          style="background-color: #41778b; box-shadow: 0 4px 20px rgba(22, 100, 122, 0.15)"
        >
          <span v-if="isSubmitting" class="material-symbols-outlined text-xl animate-spin">progress_activity</span>
          <template v-else>
            {{ t('addExpense.submit') }}
            <span class="material-symbols-outlined text-xl">check_circle</span>
          </template>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.percentage-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  border-radius: 9999px;
  background: #dceaef;
  outline: none;
}
.percentage-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #41778b;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(22, 100, 122, 0.2);
}
.percentage-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #41778b;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(22, 100, 122, 0.2);
}
.percentage-slider::-moz-range-track {
  height: 8px;
  border-radius: 9999px;
  background: #dceaef;
}
.percentage-slider:disabled::-webkit-slider-thumb { background: #97bfce; }
.percentage-slider:disabled::-moz-range-thumb { background: #97bfce; }
</style>
