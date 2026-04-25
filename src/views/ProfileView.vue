<script setup>
import { ref, computed } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.js'
import api from '@/lib/axios.js'
import InputError from '@/components/inputError.vue'

const router = useRouter()
const { t } = useI18n()
const auth = useAuthStore()

// ─── Profile form ───
const profileSchema = computed(() =>
  yup.object({
    name: yup.string().required(t('profile.errors.nameRequired')).min(2, t('profile.errors.nameShort')),
  })
)

const {
  handleSubmit: handleProfileSubmit,
  setErrors: setProfileErrors,
  isSubmitting: profileSubmitting,
} = useForm({
  validationSchema: profileSchema,
  initialValues: {
    name: auth.user?.name ?? '',
  },
})

const { value: name, errorMessage: nameError } = useField('name')

// ─── Avatar ───
const avatarPreview = ref(auth.user?.avatar?.url ?? null)
const avatarFile = ref(null)
const avatarError = ref(null)
const fileInput = ref(null)
const MAX_AVATAR_SIZE = 2 * 1024 * 1024

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return

  if (file.size > MAX_AVATAR_SIZE) {
    avatarError.value = t('profile.personalInfo.photoTooLarge')
    avatarFile.value = null
    e.target.value = ''
    return
  }

  avatarError.value = null
  avatarPreview.value = URL.createObjectURL(file)
  avatarFile.value = file
}

function triggerUpload() {
  fileInput.value.click()
}

// ─── Password form ───
const passwordSchema = computed(() =>
  yup.object({
    current_password: yup.string().required(t('profile.errors.currentRequired')),
    password: yup.string().required(t('profile.errors.newRequired')).min(8, t('profile.errors.newMin')),
    password_confirmation: yup
      .string()
      .required(t('profile.errors.confirmRequired'))
      .oneOf([yup.ref('password')], t('profile.errors.confirmMismatch')),
  })
)

const {
  handleSubmit: handlePasswordSubmit,
  setErrors: setPasswordErrors,
  isSubmitting: passwordSubmitting,
  resetForm: resetPasswordForm,
} = useForm({ validationSchema: passwordSchema })

const { value: currentPassword, errorMessage: currentPasswordError } = useField('current_password')
const { value: newPassword, errorMessage: newPasswordError } = useField('password')
const { value: passwordConfirmation, errorMessage: passwordConfirmationError } =
  useField('password_confirmation')

const showPassword = ref(false)

// ─── Feedback ───
const profileSuccess = ref(false)
const passwordSuccess = ref(false)

function flashSuccess(flag) {
  flag.value = true
  setTimeout(() => (flag.value = false), 3000)
}

// ─── Submit profile ───
const submitProfile = handleProfileSubmit(async (values) => {
  try {
    // console.log(values.name+"testing");
    const payload = new FormData()
    payload.append('name', values.name);
    payload.append('_method','PATCH');
    if (avatarFile.value) {
      payload.append('avatar', avatarFile.value)
    }
    console.log(payload)
    const { data } = await api.post('/api/v1/profile', payload)
    console.log(data || "test");
    auth.setUser(data.data)
    avatarPreview.value = data.data?.avatar?.url ?? null
    avatarFile.value = null
    flashSuccess(profileSuccess)
  } catch (err) {
    if (err.response?.status === 422) {
      const errors = {}
      for (const [field, messages] of Object.entries(err.response.data.errors ?? {})) {
        errors[field] = messages[0]
      }
      setProfileErrors(errors)
    }
  }
})

// ─── Submit password ───
const submitPassword = handlePasswordSubmit(async (values) => {
  try {
    await api.put('/api/user/password', values)
    resetPasswordForm()
    flashSuccess(passwordSuccess)
  } catch (err) {
    if (err.response?.status === 422) {
      const errors = {}
      for (const [field, messages] of Object.entries(err.response.data.errors ?? {})) {
        errors[field] = messages[0]
      }
      setPasswordErrors(errors)
    }
  }
})

</script>

<template>
  <div class="min-h-screen bg-brand-background pt-28 pb-16 px-6 md:px-12 lg:px-20">
    <!-- Back button -->
    <button
      @click="router.back()"
      class="flex items-center gap-1.5 text-sm font-semibold text-brand-textSecondary hover:text-brand-text transition-colors cursor-pointer"
    >
      <span class="material-symbols-outlined text-lg">arrow_back</span>
      {{ t('profile.back') }}
    </button>

    <h1 class="text-3xl md:text-4xl font-extrabold text-brand-text tracking-tight pt-6">
      {{ t('profile.title') }}
    </h1>
    <p class="text-brand-textSecondary text-base pt-2">
      {{ t('profile.subtitle') }}
    </p>

    <div class="flex flex-col lg:flex-row gap-8 pt-10">
      <!-- Profile info card -->
      <div class="flex-1">
        <div class="bg-brand-surface rounded-3xl p-8 shadow-[0_4px_24px_rgba(22,100,122,0.06)]">
          <h2 class="text-xl font-bold text-brand-text">{{ t('profile.personalInfo.title') }}</h2>
          <p class="text-brand-textSecondary text-sm pt-1">
            {{ t('profile.personalInfo.subtitle') }}
          </p>

          <form @submit.prevent="submitProfile" class="flex flex-col gap-6 pt-8">
            <!-- Avatar -->
            <div class="flex flex-col gap-3">
              <label class="text-sm font-bold text-brand-text">{{ t('profile.personalInfo.photo') }}</label>
              <div class="flex items-center gap-5">
                <div
                  class="w-20 h-20 rounded-full bg-cerulean-100 overflow-hidden shrink-0 flex items-center justify-center shadow-[0_4px_20px_rgba(22,100,122,0.10)]"
                >
                  <img
                    v-if="avatarPreview"
                    :src="avatarPreview"
                    alt="Avatar preview"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="material-symbols-outlined text-cerulean-400 text-4xl"
                    >person</span
                  >
                </div>
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      @click="triggerUpload"
                      class="inline-flex items-center gap-2 rounded-full bg-cerulean-100 px-5 py-2 text-sm font-bold text-cerulean-700 hover:bg-cerulean-200 transition-colors cursor-pointer"
                    >
                      <span class="material-symbols-outlined text-base">upload</span>
                      {{ t('profile.personalInfo.changePhoto') }}
                    </button>
                  </div>
                  <p class="text-xs text-brand-textSecondary">{{ t('profile.personalInfo.photoHint') }}</p>
                </div>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onFileChange"
                />
              </div>
              <p v-if="avatarError" class="text-xs text-red-500 font-medium">{{ avatarError }}</p>
            </div>

            <!-- Name -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-bold text-brand-text">{{ t('profile.personalInfo.fullName') }}</label>
              <div class="relative">
                <span
                  class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none"
                  >badge</span
                >
                <input
                  type="text"
                  v-model="name"
                  class="w-full bg-brand-background text-brand-text placeholder:text-brand-disabled rounded-full pl-12 pr-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition"
                  :class="{ 'ring-2 ring-red-400/50 bg-red-50': nameError }"
                />
              </div>
              <InputError :message="nameError" />
            </div>


            <!-- Submit -->
            <div class="flex items-center gap-4 pt-2">
              <button
                type="submit"
                :disabled="profileSubmitting"
                class="inline-flex items-center justify-center gap-2 rounded-full bg-cerulean-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-cerulean-700 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                <span
                  v-if="profileSubmitting"
                  class="material-symbols-outlined text-lg animate-spin"
                  >progress_activity</span
                >
                <template v-else>
                  {{ t('profile.personalInfo.save') }}
                  <span class="material-symbols-outlined text-lg">check</span>
                </template>
              </button>

              <Transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="opacity-0 translate-x-2"
                enter-to-class="opacity-100 translate-x-0"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
              >
                <span
                  v-if="profileSuccess"
                  class="text-sm font-semibold text-emerald-600 flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-lg">check_circle</span>
                  {{ t('profile.personalInfo.saved') }}
                </span>
              </Transition>
            </div>
          </form>
        </div>
      </div>

      <!-- Password card -->
      <div class="flex-1">
        <div class="bg-brand-surface rounded-3xl p-8 shadow-[0_4px_24px_rgba(22,100,122,0.06)]">
          <h2 class="text-xl font-bold text-brand-text">{{ t('profile.password.title') }}</h2>
          <p class="text-brand-textSecondary text-sm pt-1">
            {{ t('profile.password.subtitle') }}
          </p>

          <form @submit.prevent="submitPassword" class="flex flex-col gap-6 pt-8">
            <!-- Current password -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-bold text-brand-text">{{ t('profile.password.current') }}</label>
              <div class="relative">
                <span
                  class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none"
                  >lock</span
                >
                <input
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  v-model="currentPassword"
                  class="w-full bg-brand-background text-brand-text placeholder:text-brand-disabled rounded-full pl-12 pr-12 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition"
                  :class="{ 'ring-2 ring-red-400/50 bg-red-50': currentPasswordError }"
                />
              </div>
              <InputError :message="currentPasswordError" />
            </div>

            <!-- New password -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-bold text-brand-text">{{ t('profile.password.new') }}</label>
              <div class="relative">
                <span
                  class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none"
                  >lock_reset</span
                >
                <input
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  v-model="newPassword"
                  class="w-full bg-brand-background text-brand-text placeholder:text-brand-disabled rounded-full pl-12 pr-12 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition"
                  :class="{ 'ring-2 ring-red-400/50 bg-red-50': newPasswordError }"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-5 top-1/2 -translate-y-1/2 text-cerulean-500 hover:text-cerulean-800 transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  <span class="material-symbols-outlined text-xl">
                    {{ showPassword ? 'visibility_off' : 'visibility' }}
                  </span>
                </button>
              </div>
              <InputError :message="newPasswordError" />
            </div>

            <!-- Confirm new password -->
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-bold text-brand-text">{{ t('profile.password.confirm') }}</label>
              <div class="relative">
                <span
                  class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none"
                  >lock_reset</span
                >
                <input
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  v-model="passwordConfirmation"
                  class="w-full bg-brand-background text-brand-text placeholder:text-brand-disabled rounded-full pl-12 pr-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition"
                  :class="{ 'ring-2 ring-red-400/50 bg-red-50': passwordConfirmationError }"
                />
              </div>
              <InputError :message="passwordConfirmationError" />
            </div>

            <!-- Submit -->
            <div class="flex items-center gap-4 pt-2">
              <button
                type="submit"
                :disabled="passwordSubmitting"
                class="inline-flex items-center justify-center gap-2 rounded-full bg-cerulean-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-cerulean-700 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                <span
                  v-if="passwordSubmitting"
                  class="material-symbols-outlined text-lg animate-spin"
                  >progress_activity</span
                >
                <template v-else>
                  {{ t('profile.password.update') }}
                  <span class="material-symbols-outlined text-lg">check</span>
                </template>
              </button>

              <Transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="opacity-0 translate-x-2"
                enter-to-class="opacity-100 translate-x-0"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
              >
                <span
                  v-if="passwordSuccess"
                  class="text-sm font-semibold text-emerald-600 flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-lg">check_circle</span>
                  {{ t('profile.password.updated') }}
                </span>
              </Transition>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
