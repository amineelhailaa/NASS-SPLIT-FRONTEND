<script setup>
import { ref, computed } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import InputError from '@/components/inputError.vue'
import api from '@/lib/axios.js'
import logoRaw from '@/assets/logo.svg?raw'

const emit = defineEmits(['created'])
const router = useRouter()
const { t } = useI18n()

// --- Step & success state ---
const currentStep = ref(1)
const showSuccess = ref(false)
const createdGroup = ref(null)

// --- Avatar ---
const avatarPreview = ref(null)
const avatarFile = ref(null)
const fileInput = ref(null)

// --- Invite state ---
const emailInput = ref('')
const emailInputError = ref('')
const invitedEmails = ref([])
const inviteLink = ref('')
const linkCopied = ref(false)
const isCreating = ref(false)

// --- Veevalidate (step 1 fields) ---
const schema = computed(() =>
  yup.object({
    name: yup.string().required(t('newGroup.errors.nameRequired')),
    description: yup
      .string()
      .required(t('newGroup.errors.descRequired'))
      .max(300, t('newGroup.errors.descMax')),
  })
)

const { handleSubmit, setErrors } = useForm({ validationSchema: schema })
const { value: name, errorMessage: nameError } = useField('name')
const { value: description, errorMessage: descriptionError } = useField('description')

// --- Avatar handlers ---
function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  avatarPreview.value = URL.createObjectURL(file)
  avatarFile.value = file
}

function triggerUpload() {
  fileInput.value.click()
}

// --- Step 1 → 2 ---
const goToStep2 = handleSubmit(() => {
  currentStep.value = 2
})

// --- Email invite ---
function addEmail() {
  const val = emailInput.value.trim()
  if (!val) return
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    emailInputError.value = t('newGroup.errors.emailInvalid')
    return
  }
  if (invitedEmails.value.includes(val)) {
    emailInputError.value = t('newGroup.errors.emailDuplicate')
    return
  }
  invitedEmails.value.push(val)
  emailInput.value = ''
  emailInputError.value = ''
}

function removeEmail(email) {
  invitedEmails.value = invitedEmails.value.filter((e) => e !== email)
}

async function copyLink() {
  if (!inviteLink.value) return
  await navigator.clipboard.writeText(inviteLink.value)
  linkCopied.value = true
  setTimeout(() => (linkCopied.value = false), 2000)
}

// --- Final submit (step 2) ---
async function createGroup() {
  isCreating.value = true
  try {
    // 1. Create the group
    const formData = new FormData()
    formData.append('name', name.value)
    formData.append('description', description.value)
    if (avatarFile.value) formData.append('avatar', avatarFile.value)
    console.log(formData);
    const { data: res } = await api.post('/api/v1/groups', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    createdGroup.value = res.data ?? res

    // 2. Fetch invite code to build the shareable link
    try {
      const { data: codeRes } = await api.get(`/api/v1/groups/${createdGroup.value.id}/invitation-code`)
      const code = codeRes.data?.invitation_code ?? codeRes.invitation_code
      if (code) inviteLink.value = `${window.location.origin}/groups/join/${code}`
    } catch {
      // non-critical — skip silently
    }

    // 3. Send email invites one by one
    for (const email of invitedEmails.value) {
      try {
        await api.post(`/api/v1/groups/${createdGroup.value.id}/invite`, { email })
      } catch {
        // continue with remaining emails
      }
    }

    showSuccess.value = true
    emit('created', createdGroup.value)
  } catch (err) {
    if (err.response?.status === 422) {
      const laravelErrors = {}
      for (const [field, messages] of Object.entries(err.response.data.errors ?? {})) {
        laravelErrors[field] = messages[0]
      }
      setErrors(laravelErrors)
      currentStep.value = 1
    }
  } finally {
    isCreating.value = false
  }
}

function goToDashboard() {
  router.push({ name: 'group-detail', params: { id: createdGroup.value.id } })
}

function inviteMore() {
  invitedEmails.value = []
  emailInput.value = ''
  showSuccess.value = false
  currentStep.value = 2
}
</script>

<template>
  <div class="flex flex-col gap-6" style="font-family: 'Plus Jakarta Sans', sans-serif">

    <!-- Logo -->
    <div class="flex justify-center">
      <div class="logo-inject w-10 h-10" v-html="logoRaw" />
    </div>

    <!-- ── Success State ── -->
    <div v-if="showSuccess" class="flex flex-col items-center gap-6 py-2">
      <div
        class="w-20 h-20 rounded-full bg-cerulean-100 overflow-hidden flex items-center justify-center"
        style="box-shadow: 0 4px 20px rgba(22,100,122,0.12)"
      >
        <img
          v-if="createdGroup?.avatar"
          :src="createdGroup.avatar"
          alt="Group avatar"
          class="w-full h-full object-cover"
        />
        <span v-else class="material-symbols-outlined text-cerulean-400 text-4xl">group</span>
      </div>

      <div class="flex flex-col items-center gap-1">
        <h2 class="text-2xl font-extrabold text-cerulean-800">{{ t('newGroup.success.title') }}</h2>
        <p class="text-cerulean-500 font-semibold text-base">{{ createdGroup?.name }}</p>
      </div>

      <div class="flex flex-col gap-3 w-full">
        <button
          @click="goToDashboard"
          class="w-full flex items-center justify-center gap-2 rounded-full py-4 text-base font-bold text-white cursor-pointer"
          style="background-color: #41778b; box-shadow: 0 4px 20px rgba(22,100,122,0.15)"
        >
          <span class="material-symbols-outlined text-xl">dashboard</span>
          {{ t('newGroup.success.dashboard') }}
        </button>
        <button
          @click="inviteMore"
          class="w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-base font-bold text-cerulean-700 bg-cerulean-100 hover:bg-cerulean-200 transition-colors cursor-pointer"
        >
          <span class="material-symbols-outlined text-xl">person_add</span>
          {{ t('newGroup.success.invite') }}
        </button>
      </div>
    </div>

    <!-- ── Wizard ── -->
    <template v-else>

      <!-- Progress bar -->
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-cerulean-800/50">{{ t('newGroup.step', { current: currentStep }) }}</span>
          <span class="text-xs font-bold text-cerulean-600">{{ currentStep }}/2</span>
        </div>
        <div class="w-full bg-cerulean-100 rounded-full h-1.5">
          <div
            class="h-1.5 rounded-full bg-cerulean-600 transition-all duration-500"
            :style="{ width: currentStep === 1 ? '50%' : '100%' }"
          />
        </div>
      </div>

      <!-- ── Step 1: Group Details ── -->
      <form v-if="currentStep === 1" @submit.prevent="goToStep2" class="flex flex-col gap-5">
        <h2 class="text-xl font-extrabold text-cerulean-800">{{ t('newGroup.step1.title') }}</h2>

        <!-- Avatar -->
        <div class="flex flex-col gap-3">
          <label class="text-sm font-bold text-cerulean-800">
            {{ t('newGroup.step1.photo') }}
            <span class="text-cerulean-800/40 font-normal">{{ t('newGroup.step1.optional') }}</span>
          </label>
          <div class="flex items-center gap-5">
            <div
              class="w-16 h-16 rounded-full bg-cerulean-100 overflow-hidden shrink-0 flex items-center justify-center"
              style="box-shadow: 0 4px 20px rgba(22,100,122,0.10)"
            >
              <img v-if="avatarPreview" :src="avatarPreview" alt="Group avatar" class="w-full h-full object-cover" />
              <span v-else class="material-symbols-outlined text-cerulean-400 text-3xl">group</span>
            </div>
            <div class="flex flex-col gap-1.5">
              <button
                type="button"
                @click="triggerUpload"
                class="inline-flex items-center gap-2 rounded-full border-2 border-cerulean-300 px-5 py-2 text-sm font-bold text-cerulean-700 hover:bg-cerulean-100 transition-colors cursor-pointer"
              >
                <span class="material-symbols-outlined text-base">upload</span>
                {{ t('newGroup.step1.upload') }}
              </button>
              <p class="text-xs text-cerulean-800/40">{{ t('newGroup.step1.uploadHint') }}</p>
            </div>
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
          </div>
        </div>

        <!-- Name -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-bold text-cerulean-800">{{ t('newGroup.step1.name') }}</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none">group</span>
            <input
              type="text"
              :placeholder="t('newGroup.step1.namePlaceholder')"
              v-model="name"
              class="w-full bg-cerulean-100 text-cerulean-800 placeholder:text-cerulean-800/30 rounded-full pl-12 pr-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition"
              :class="{ 'ring-2 ring-red-400/50 bg-red-50': nameError }"
            />
          </div>
          <InputError :message="nameError" />
        </div>

        <!-- Description -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-bold text-cerulean-800">{{ t('newGroup.step1.description') }}</label>
          <div class="relative">
            <textarea
              rows="4"
              :placeholder="t('newGroup.step1.descPlaceholder')"
              v-model="description"
              maxlength="300"
              class="w-full bg-cerulean-100 text-cerulean-800 placeholder:text-cerulean-800/30 rounded-2xl px-5 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition resize-none"
              :class="{ 'ring-2 ring-red-400/50 bg-red-50': descriptionError }"
            />
            <span class="absolute bottom-3 right-4 text-xs text-cerulean-800/30">
              {{ description?.length ?? 0 }}/300
            </span>
          </div>
          <InputError :message="descriptionError" />
        </div>

        <button
          type="submit"
          class="w-full flex items-center justify-center gap-2 rounded-full py-4 text-base font-bold text-white cursor-pointer"
          style="background-color: #41778b; box-shadow: 0 4px 20px rgba(22,100,122,0.15)"
        >
          {{ t('newGroup.step1.next') }}
          <span class="material-symbols-outlined text-xl">arrow_forward</span>
        </button>
      </form>

      <!-- ── Step 2: Invite Roommates ── -->
      <div v-else class="flex flex-col gap-5">
        <h2 class="text-xl font-extrabold text-cerulean-800">{{ t('newGroup.step2.title') }}</h2>

        <!-- Email input -->
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-bold text-cerulean-800">{{ t('newGroup.step2.inviteByEmail') }}</label>
          <div class="flex gap-2">
            <div class="relative flex-1">
              <span class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none">mail</span>
              <input
                type="email"
                :placeholder="t('newGroup.step2.emailPlaceholder')"
                v-model="emailInput"
                @keydown.enter.prevent="addEmail"
                class="w-full bg-cerulean-100 text-cerulean-800 placeholder:text-cerulean-800/30 rounded-full pl-12 pr-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition"
                :class="{ 'ring-2 ring-red-400/50 bg-red-50': emailInputError }"
              />
            </div>
            <button
              type="button"
              @click="addEmail"
              class="shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-white cursor-pointer"
              style="background-color: #41778b"
            >
              <span class="material-symbols-outlined">add</span>
            </button>
          </div>
          <InputError :message="emailInputError" />
        </div>

        <!-- Copy invite link -->
        <button
          type="button"
          @click="copyLink"
          :disabled="!inviteLink"
          class="flex items-center gap-3 rounded-2xl px-5 py-3.5 bg-cerulean-100 hover:bg-cerulean-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span class="material-symbols-outlined text-cerulean-600">link</span>
          <span class="text-sm font-bold text-cerulean-700 flex-1 text-left">
            {{ linkCopied ? t('newGroup.step2.linkCopied') : t('newGroup.step2.copyLink') }}
          </span>
          <span v-if="linkCopied" class="material-symbols-outlined text-cerulean-500 text-base">check</span>
        </button>
        <p class="text-xs text-cerulean-800/40 pl-1">{{ t('newGroup.step2.linkAfterCreate') }}</p>

        <!-- Invited emails list -->
        <div v-if="invitedEmails.length" class="flex flex-col gap-2">
          <p class="text-xs font-bold text-cerulean-800/50 uppercase tracking-wide">{{ t('newGroup.step2.toBeInvited') }}</p>
          <div
            v-for="email in invitedEmails"
            :key="email"
            class="flex items-center justify-between rounded-2xl px-4 py-3 bg-cerulean-50"
          >
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-cerulean-400 text-lg">person</span>
              <span class="text-sm text-cerulean-800 font-medium">{{ email }}</span>
            </div>
            <button
              type="button"
              @click="removeEmail(email)"
              class="text-cerulean-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex flex-col gap-3">
          <button
            type="button"
            @click="createGroup"
            :disabled="isCreating"
            class="w-full flex items-center justify-center gap-2 rounded-full py-4 text-base font-bold text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            style="background-color: #41778b; box-shadow: 0 4px 20px rgba(22,100,122,0.15)"
          >
            <span v-if="isCreating" class="material-symbols-outlined text-xl animate-spin">progress_activity</span>
            <template v-else>
              {{ t('newGroup.step2.create') }}
              <span class="material-symbols-outlined text-xl">check_circle</span>
            </template>
          </button>
          <button
            type="button"
            @click="currentStep = 1"
            class="w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-cerulean-600 hover:bg-cerulean-100 transition-colors cursor-pointer"
          >
            <span class="material-symbols-outlined text-base">arrow_back</span>
            {{ t('newGroup.step2.back') }}
          </button>
        </div>
      </div>

    </template>
  </div>
</template>

<style scoped>
.logo-inject :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>