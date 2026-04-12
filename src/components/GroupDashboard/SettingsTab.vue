<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/lib/axios'

const props = defineProps({
  groupId: [Number, String],
  group: Object,
})

const router = useRouter()

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
    success.value = 'Group updated'
  } catch {
    error.value = 'Failed to update group'
  } finally {
    saving.value = false
  }
}

async function toggleSettle() {
  savingSettings.value = true
  success.value = null
  error.value = null
  try {
    settleEnabled.value = !settleEnabled.value
    await api.patch(`/api/v1/groups/${props.groupId}/settings`, {
      settle: settleEnabled.value,
    })
    success.value = `Settle rule ${settleEnabled.value ? 'enabled' : 'disabled'}`
  } catch {
    settleEnabled.value = !settleEnabled.value
    error.value = 'Failed to update setting'
  } finally {
    savingSettings.value = false
  }
}

async function deleteGroup() {
  if (!confirm('Are you sure you want to delete this group? This cannot be undone.')) return
  deleting.value = true
  try {
    await api.delete(`/api/v1/groups/${props.groupId}`)
    router.push({ name: 'groups' })
  } catch {
    error.value = 'Failed to delete group'
    deleting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-8 max-w-xl">
    <h2 class="text-brand-text font-bold text-xl">Group Settings</h2>

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
      <h3 class="text-brand-text font-bold text-base">General</h3>

      <div class="flex flex-col gap-2">
        <label class="text-brand-textSecondary text-sm font-semibold">Group Name</label>
        <input
          v-model="name"
          type="text"
          class="px-4 py-3 rounded-xl bg-brand-surface text-brand-text text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-brand-textSecondary text-sm font-semibold">Description</label>
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
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>

    <!-- Settle rule -->
    <div class="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(22,100,122,0.06)] flex flex-col gap-4">
      <h3 class="text-brand-text font-bold text-base">Rules</h3>

      <div class="flex items-center justify-between">
        <div class="flex flex-col gap-1">
          <span class="text-brand-text text-sm font-semibold">Settle before leaving</span>
          <span class="text-brand-textSecondary text-xs">Members must settle debts before leaving or being kicked</span>
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
      <h3 class="text-red-600 font-bold text-base">Danger Zone</h3>
      <p class="text-brand-textSecondary text-sm">Permanently delete this group and all its data.</p>
      <button
        @click="deleteGroup"
        :disabled="deleting"
        class="self-start px-6 py-2.5 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
      >
        {{ deleting ? 'Deleting...' : 'Delete Group' }}
      </button>
    </div>
  </div>
</template>
