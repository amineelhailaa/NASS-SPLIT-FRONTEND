<script setup>
import { ref, computed } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.js'
import InputError from '@/components/inputError.vue'
import logoRaw from '@/assets/logo.svg?raw'

const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()

const schema = yup.object({
  name: yup.string().required(t('auth.signup.errors.nameRequired')).min(2, t('auth.signup.errors.nameShort')),
  email: yup.string().required(t('auth.signup.errors.emailRequired')).email(t('auth.signup.errors.emailInvalid')),
  password: yup
    .string()
    .required(t('auth.signup.errors.passwordRequired'))
    .min(8, t('auth.signup.errors.passwordMin')),
  password_confirmation: yup
    .string()
    .required(t('auth.signup.errors.confirmRequired'))
    .oneOf([yup.ref('password')], t('auth.signup.errors.passwordMismatch')),
})

const { handleSubmit, setErrors, isSubmitting } = useForm({ validationSchema: schema })
const { value: name, errorMessage: nameError } = useField('name')
const { value: email, errorMessage: emailError } = useField('email')
const { value: password, errorMessage: passwordError } = useField('password')
const { value: passwordConfirmation, errorMessage: passwordConfirmationError } = useField('password_confirmation')

const showPassword = ref(false)
const avatarPreview = ref(null)
const avatarError = ref(null)
const fileInput = ref(null)
const avatarFile = ref(null)

const features = computed(() => [
  {
    icon: 'group_add',
    title: t('auth.signup.features.createGroup.title'),
    desc: t('auth.signup.features.createGroup.desc'),
  },
  {
    icon: 'receipt_long',
    title: t('auth.signup.features.trackExpense.title'),
    desc: t('auth.signup.features.trackExpense.desc'),
  },
  {
    icon: 'handshake',
    title: t('auth.signup.features.settle.title'),
    desc: t('auth.signup.features.settle.desc'),
  },
])

const copyrightYear = new Date().getFullYear()

const MAX_AVATAR_SIZE = 2 * 1024 * 1024

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return

  if (file.size > MAX_AVATAR_SIZE) {
    avatarError.value = t('auth.signup.avatarTooLarge')
    avatarPreview.value = null
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

const handleSignUp = handleSubmit(async (values) => {
  try {
    const payload = new FormData()
    payload.append('name', values.name)
    payload.append('email', values.email)
    payload.append('password', values.password)
    payload.append('password_confirmation', values.password_confirmation)
    if (avatarFile.value) payload.append('avatar', avatarFile.value)
    await auth.register(payload)
    router.push('/')
  } catch (err) {
    console.log('REGISTER ERROR:', err.response?.status, JSON.stringify(err.response?.data, null, 2))
    if (err.response?.status === 422) {
      const laravelErrors = {}
      for (const [field, messages] of Object.entries(err.response.data.errors ?? {})) {
        laravelErrors[field] = messages[0]
      }
      setErrors(laravelErrors)
    } else if (err.response?.status === 429) {
      setErrors({ email: t('common.tooManyAttempts') })
    }
  }
})
</script>

<template>
  <div
    class="min-h-screen flex bg-cerulean-50"
    style="font-family: 'Plus Jakarta Sans', sans-serif"
  >
    <!-- Mobile top bar -->
    <div
      class="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md"
      style="box-shadow: 0 2px 16px rgba(22,100,122,0.06)"
    >
      <router-link to="/" class="flex items-center gap-2">
        <div class="logo-inject w-9 h-9 overflow-hidden shrink-0" v-html="logoRaw" />
        <span class="text-cerulean-800 text-base font-bold tracking-wide">{{ t('brand.name') }}</span>
      </router-link>
      <router-link
        to="/"
        class="flex items-center gap-1 text-sm font-semibold text-cerulean-600 hover:text-cerulean-800 transition-colors"
      >
        <span class="material-symbols-outlined text-base">arrow_back</span>
        {{ t('common.home') }}
      </router-link>
    </div>

    <!-- Left panel -->
    <div
      class="hidden lg:flex flex-col justify-between w-[50%] bg-cerulean-800 px-16 py-14 relative overflow-hidden"
    >
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-cerulean-700/50 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-cerulean-600/30 rounded-full blur-3xl"></div>

      <router-link to="/" class="relative z-10 flex items-center gap-3 w-fit">
        <div class="logo-inject w-12 h-12 overflow-hidden shrink-0" v-html="logoRaw" />
        <span class="text-white text-xl font-bold tracking-wide">{{ t('brand.name') }}</span>
      </router-link>

      <div class="relative z-10 flex flex-col gap-10">
        <div class="flex flex-col gap-4">
          <h2 class="text-5xl font-extrabold text-white leading-tight">
            {{ t('auth.signup.brandTitleL1') }}<br />{{ t('auth.signup.brandTitleL2') }}
          </h2>
          <p class="text-white/60 text-lg leading-relaxed">
            {{ t('auth.signup.brandSubtitle') }}
          </p>
        </div>
        <div class="flex flex-col gap-3">
          <div
            v-for="f in features"
            :key="f.icon"
            class="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4"
          >
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-white text-xl">{{ f.icon }}</span>
            </div>
            <div>
              <p class="text-white font-semibold text-sm">{{ f.title }}</p>
              <p class="text-white/50 text-xs">{{ f.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <p class="relative z-10 text-white/30 text-xs">{{ t('common.copyright', { year: copyrightYear }) }}</p>
    </div>

    <!-- Right panel: form -->
    <div class="flex flex-1 items-center justify-center px-8 md:px-16 py-14 pt-28 lg:pt-14">
      <div class="w-full max-w-md flex flex-col gap-8">

        <div class="flex flex-col gap-2">
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-cerulean-800">
            {{ t('auth.signup.title') }}
          </h1>
          <p class="text-cerulean-800/50 text-lg">{{ t('auth.signup.subtitle') }}</p>
        </div>

        <form @submit.prevent="handleSignUp" class="flex flex-col gap-5">

          <!-- Avatar upload -->
          <div class="flex flex-col gap-3">
            <label class="text-sm font-bold text-cerulean-800">{{ t('auth.signup.avatarLabel') }}</label>
            <div class="flex items-center gap-5">
              <div
                class="w-20 h-20 rounded-full bg-cerulean-100 overflow-hidden shrink-0 flex items-center justify-center"
                style="box-shadow: 0 4px 20px rgba(22,100,122,0.10)"
              >
                <img
                  v-if="avatarPreview"
                  :src="avatarPreview"
                  :alt="t('auth.signup.avatarPreviewAlt')"
                  class="w-full h-full object-cover"
                />
                <span v-else class="material-symbols-outlined text-cerulean-400 text-4xl">person</span>
              </div>
              <div class="flex flex-col gap-1.5">
                <button
                  type="button"
                  @click="triggerUpload"
                  class="inline-flex items-center gap-2 rounded-full border-2 border-cerulean-300 px-5 py-2 text-sm font-bold text-cerulean-700 hover:bg-cerulean-100 transition-colors cursor-pointer"
                >
                  <span class="material-symbols-outlined text-base">upload</span>
                  {{ t('auth.signup.uploadPhoto') }}
                </button>
                <p class="text-xs text-cerulean-800/40">{{ t('auth.signup.uploadHint') }}</p>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFileChange"
              />
            </div>
            <p v-if="avatarError" class="text-xs text-red-500 font-medium mt-1">{{ avatarError }}</p>
          </div>

          <!-- Name -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-cerulean-800">{{ t('auth.signup.fullName') }}</label>
            <div class="relative">
              <span
                class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none">badge</span>
              <input
                type="text"
                :placeholder="t('auth.signup.fullNamePlaceholder')"
                v-model="name"
                class="w-full bg-cerulean-100 text-cerulean-800 placeholder:text-cerulean-800/30 rounded-full pl-12 pr-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition"
                :class="{ 'ring-2 ring-red-400/50 bg-red-50': nameError }"
              />
            </div>
            <InputError :message="nameError" />
          </div>

          <!-- Email -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-cerulean-800">{{ t('common.emailAddress') }}</label>
            <div class="relative">
              <span
                class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none">mail</span>
              <input
                type="email"
                :placeholder="t('common.emailPlaceholder')"
                v-model="email"
                class="w-full bg-cerulean-100 text-cerulean-800 placeholder:text-cerulean-800/30 rounded-full pl-12 pr-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition"
                :class="{ 'ring-2 ring-red-400/50 bg-red-50': emailError }"
              />
            </div>
            <InputError :message="emailError" />
          </div>

          <!-- Password -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-cerulean-800">{{ t('common.password') }}</label>
            <div class="relative">
              <span
                class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none">lock</span>
              <input
                :type="showPassword ? 'text' : 'password'"
                :placeholder="t('common.passwordPlaceholder')"
                v-model="password"
                class="w-full bg-cerulean-100 text-cerulean-800 placeholder:text-cerulean-800/30 rounded-full pl-12 pr-12 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition"
                :class="{ 'ring-2 ring-red-400/50 bg-red-50': passwordError }"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-5 top-1/2 -translate-y-1/2 text-cerulean-500 hover:text-cerulean-800 transition-colors cursor-pointer"
                :aria-label="t('common.togglePassword')"
              >
                <span class="material-symbols-outlined text-xl">
                  {{ showPassword ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
            <InputError :message="passwordError" />
          </div>

          <!-- Confirm Password -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-cerulean-800">{{ t('auth.signup.confirmPassword') }}</label>
            <div class="relative">
              <span
                class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none">lock_reset</span>
              <input
                :type="showPassword ? 'text' : 'password'"
                :placeholder="t('common.passwordPlaceholder')"
                v-model="passwordConfirmation"
                class="w-full bg-cerulean-100 text-cerulean-800 placeholder:text-cerulean-800/30 rounded-full pl-12 pr-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition"
                :class="{ 'ring-2 ring-red-400/50 bg-red-50': passwordConfirmationError }"
              />
            </div>
            <InputError :message="passwordConfirmationError" />
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full flex items-center justify-center gap-2 rounded-full py-4 text-base font-bold text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            style="background-color: #41778b"
          >
            <span v-if="isSubmitting" class="material-symbols-outlined text-xl animate-spin">progress_activity</span>
            <template v-else>
              {{ t('auth.signup.submit') }}
              <span class="material-symbols-outlined text-xl">arrow_forward</span>
            </template>
          </button>
        </form>

        <p class="text-center text-sm text-cerulean-800/50">
          {{ t('auth.signup.loginPrompt') }}
          <router-link
            to="/login"
            class="text-cerulean-600 font-bold hover:text-cerulean-800 transition-colors ml-1"
          >{{ t('auth.signup.loginLink') }}</router-link>
        </p>

      </div>
    </div>
  </div>
</template>

<style scoped>
.logo-inject :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
