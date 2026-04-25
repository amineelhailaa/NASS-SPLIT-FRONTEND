<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '@/lib/axios'
import Swal from 'sweetalert2'

const props = defineProps({
  groupId: [Number, String],
  group: Object,
})

const router = useRouter()
const { t } = useI18n()

const name = ref('')
const description = ref('')
const settleEnabled = ref(false)
const saving = ref(false)
const savingSettings = ref(false)
const deleting = ref(false)
const success = ref(null)
const error = ref(null)

onMounted(() => {
  if (props.group) {
    name.value = props.group.name ?? ''
    description.value = props.group.description ?? ''
    settleEnabled.value = !!props.group.settle
  }
})

async function updateGroup() {
  saving.value = true
  success.value = null
  error.value = null
  try {
    await api.patch(`/api/v1/groups/${props.groupId}`, {
      name: name.value,
      description: description.value,
    })
    success.value = t('settings.saved')
  } catch {
    error.value = t('settings.saveFailed')
  } finally {
    saving.value = false
  }
}

async function toggleSettle() {
  const next = !settleEnabled.value
  const result = await Swal.fire({
    title: t('settings.dialogs.toggleSettle.title'),
    text: next
      ? t('settings.dialogs.toggleSettle.textEnable')
      : t('settings.dialogs.toggleSettle.textDisable'),
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: t('settings.dialogs.toggleSettle.confirm'),
    cancelButtonText: t('settings.dialogs.toggleSettle.cancel'),
    confirmButtonColor: '#41778b',
    cancelButtonColor: '#6b7280',
    customClass: {
      popup: '!rounded-2xl',
      confirmButton: '!rounded-full !font-bold',
      cancelButton: '!rounded-full !font-bold',
    },
  })
  if (!result.isConfirmed) return
  savingSettings.value = true
  success.value = null
  error.value = null
  try {
    settleEnabled.value = next
    await api.patch(`/api/v1/groups/${props.groupId}/settings`, {
      settle: settleEnabled.value,
    })
  } catch {
    settleEnabled.value = !settleEnabled.value
    error.value = t('settings.settingFailed')
  } finally {
    savingSettings.value = false
  }
}

async function deleteGroup() {
  const result = await Swal.fire({
    title: t('settings.dialogs.delete.title'),
    text: t('settings.dialogs.delete.text'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: t('settings.dialogs.delete.confirm'),
    cancelButtonText: t('settings.dialogs.delete.cancel'),
    confirmButtonColor: '#e53e3e',
    cancelButtonColor: '#41778b',
    borderRadius: '1rem',
    customClass: {
      popup: '!rounded-2xl',
      confirmButton: '!rounded-full !font-bold',
      cancelButton: '!rounded-full !font-bold',
    },
  })
  if (!result.isConfirmed) return
  deleting.value = true
  try {
    await api.delete(`/api/v1/groups/${props.groupId}`)
    await Swal.fire({
      title: t('settings.dialogs.delete.successTitle'),
      text: t('settings.dialogs.delete.successText'),
      icon: 'success',
      confirmButtonColor: '#41778b',
      customClass: {
        popup: '!rounded-2xl',
        confirmButton: '!rounded-full !font-bold',
      },
      timer: 1500,
      showConfirmButton: false,
    })
    router.push({ name: 'groups' })
  } catch {
    error.value = t('settings.saveFailed')
    deleting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <h2 class="text-brand-text font-bold text-xl">{{ t('settings.title') }}</h2>

    <!-- Success / Error -->
    <div v-if="success" class="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
      <span class="material-symbols-outlined text-[18px]">check_circle</span>
      {{ success }}
    </div>
    <div v-if="error" class="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
      <span class="material-symbols-outlined text-[18px]">error</span>
      {{ error }}
    </div>

    <!-- Group info -->
    <div class="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(22,100,122,0.06)] flex flex-col gap-5">
      <h3 class="text-brand-text font-bold text-base">{{ t('settings.general') }}</h3>

      <div class="flex flex-col gap-2">
        <label class="text-brand-textSecondary text-sm font-semibold">{{ t('settings.name') }}</label>
        <input
          v-model="name"
          type="text"
          class="px-4 py-3 rounded-xl bg-brand-surface text-brand-text text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-brand-textSecondary text-sm font-semibold">{{ t('settings.description') }}</label>
        <textarea
          v-model="description"
          rows="3"
          class="px-4 py-3 rounded-xl bg-brand-surface text-brand-text text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none"
        />
      </div>

      <button
        @click="updateGroup"
        :disabled="saving"
        class="self-start px-6 py-2.5 rounded-full bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primaryHover transition-colors disabled:opacity-50"
      >
        {{ saving ? t('settings.saving') : t('settings.save') }}
      </button>
    </div>

    <!-- Settle rule -->
    <div class="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(22,100,122,0.06)] flex flex-col gap-4">
      <h3 class="text-brand-text font-bold text-base">{{ t('settings.rules') }}</h3>

      <div class="flex items-center justify-between">
        <div class="flex flex-col gap-1">
          <span class="text-brand-text text-sm font-semibold">{{ t('settings.settleBeforeLeaving') }}</span>
          <span class="text-brand-textSecondary text-xs">{{ t('settings.settleDesc') }}</span>
        </div>
        <button
          @click="toggleSettle"
          :disabled="savingSettings"
          class="w-12 h-7 rounded-full transition-colors relative shrink-0"
          :class="settleEnabled ? 'bg-brand-primary' : 'bg-brand-disabled'"
        >
          <div
            class="w-5 h-5 rounded-full bg-white absolute top-1 transition-[left]"
            :class="settleEnabled ? 'left-6' : 'left-1'"
          />
        </button>
      </div>
    </div>

    <!-- Danger zone -->
    <div class="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(22,100,122,0.06)] flex flex-col gap-4">
      <h3 class="text-red-600 font-bold text-base">{{ t('settings.dangerZone') }}</h3>
      <p class="text-brand-textSecondary text-sm">{{ t('settings.deleteDesc') }}</p>
      <button
        @click="deleteGroup"
        :disabled="deleting"
        class="self-start px-6 py-2.5 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
      >
        {{ deleting ? t('settings.deleting') : t('settings.deleteButton') }}
      </button>
    </div>
  </div>
</template>
