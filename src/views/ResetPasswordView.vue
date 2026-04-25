<script setup>
import { ref } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import InputError from '@/components/inputError.vue'
import logoRaw from '@/assets/logo.svg?raw'
import api from '@/lib/axios.js'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const token = route.params.token ?? ''
const emailFromUrl = route.query.email ?? ''

const showPassword = ref(false)
const showConfirm = ref(false)

const schema = yup.object({
  email: yup.string().required(t('auth.resetPassword.errors.emailRequired')).email(t('auth.resetPassword.errors.emailInvalid')),
  password: yup
    .string()
    .required(t('auth.resetPassword.errors.passwordRequired'))
    .min(8, t('auth.resetPassword.errors.passwordMin')),
  password_confirmation: yup
    .string()
    .required(t('auth.resetPassword.errors.confirmRequired'))
    .oneOf([yup.ref('password')], t('auth.resetPassword.errors.passwordMismatch')),
})

const { handleSubmit, setErrors, isSubmitting } = useForm({
  validationSchema: schema,
  initialValues: { email: emailFromUrl },
})

const { value: email, errorMessage: emailError } = useField('email')
const { value: password, errorMessage: passwordError } = useField('password')
const { value: password_confirmation, errorMessage: confirmError } = useField('password_confirmation')

const copyrightYear = new Date().getFullYear()

const handleReset = handleSubmit(async (values) => {
  try {
    await api.get('/sanctum/csrf-cookie')
    await api.post('/reset-password', { ...values, token })
    await router.push({ name: 'login', query: { reset: '1' } })
  } catch (err) {
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
  <div class="min-h-screen flex bg-cerulean-50" style="font-family: 'Plus Jakarta Sans', sans-serif">

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
        to="/login"
        class="flex items-center gap-1 text-sm font-semibold text-cerulean-600 hover:text-cerulean-800 transition-colors"
      >
        <span class="material-symbols-outlined text-base">arrow_back</span>
        {{ t('common.login') }}
      </router-link>
    </div>

    <!-- Left brand panel -->
    <div
      class="hidden lg:flex flex-col justify-between w-[50%] bg-cerulean-800 px-16 py-14 relative overflow-hidden"
    >
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-cerulean-700/50 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-cerulean-600/30 rounded-full blur-3xl"></div>

      <router-link to="/" class="relative z-10 flex items-center gap-3 w-fit">
        <div class="logo-inject w-12 h-12 overflow-hidden shrink-0" v-html="logoRaw" />
        <span class="text-white text-xl font-bold tracking-wide">{{ t('brand.name') }}</span>
      </router-link>

      <div class="relative z-10 flex flex-col gap-6">
        <div class="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center">
          <span class="material-symbols-outlined text-white text-3xl">shield_lock</span>
        </div>
        <div class="flex flex-col gap-4">
          <h2 class="text-5xl font-extrabold text-white leading-tight">
            {{ t('auth.resetPassword.brandTitleL1') }}<br />{{ t('auth.resetPassword.brandTitleL2') }}
          </h2>
          <p class="text-white/60 text-lg leading-relaxed">
            {{ t('auth.resetPassword.brandSubtitle') }}
          </p>
        </div>
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
            <span class="material-symbols-outlined text-white text-xl">password</span>
            <p class="text-white/70 text-sm">{{ t('auth.resetPassword.tip1') }}</p>
          </div>
          <div class="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
            <span class="material-symbols-outlined text-white text-xl">devices</span>
            <p class="text-white/70 text-sm">{{ t('auth.resetPassword.tip2') }}</p>
          </div>
        </div>
      </div>

      <p class="relative z-10 text-white/30 text-xs">{{ t('common.copyright', { year: copyrightYear }) }}</p>
    </div>

    <!-- Right form panel -->
    <div class="flex flex-1 items-center justify-center px-8 md:px-16 py-14 pt-28 lg:pt-14">
      <div class="w-full flex flex-col gap-10">

        <div class="flex flex-col gap-2">
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-cerulean-800">
            {{ t('auth.resetPassword.title') }}
          </h1>
          <p class="text-cerulean-800/50 text-lg">{{ t('auth.resetPassword.subtitle') }}</p>
        </div>

        <form @submit.prevent="handleReset" class="flex flex-col gap-5">

          <!-- Email -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-cerulean-800">{{ t('common.emailAddress') }}</label>
            <div class="relative">
              <span
                class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none"
              >mail</span>
              <input
                type="email"
                :placeholder="t('common.emailPlaceholder')"
                v-model="email"
                :readonly="!!emailFromUrl"
                class="w-full bg-cerulean-100 text-cerulean-800 placeholder:text-cerulean-800/30 rounded-full pl-12 pr-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition"
                :class="{
                  'ring-2 ring-red-400/50 bg-red-50': emailError,
                  'opacity-60 cursor-default': emailFromUrl,
                }"
              />
            </div>
            <InputError :message="emailError" />
          </div>

          <!-- New Password -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-cerulean-800">{{ t('auth.resetPassword.newPassword') }}</label>
            <div class="relative">
              <span
                class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none"
              >lock</span>
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
                class="absolute right-5 top-1/2 -translate-y-1/2 text-cerulean-500 hover:text-cerulean-800 transition-colors"
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
            <label class="text-sm font-bold text-cerulean-800">{{ t('auth.resetPassword.confirmPassword') }}</label>
            <div class="relative">
              <span
                class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none"
              >lock_clock</span>
              <input
                :type="showConfirm ? 'text' : 'password'"
                :placeholder="t('common.passwordPlaceholder')"
                v-model="password_confirmation"
                class="w-full bg-cerulean-100 text-cerulean-800 placeholder:text-cerulean-800/30 rounded-full pl-12 pr-12 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition"
                :class="{ 'ring-2 ring-red-400/50 bg-red-50': confirmError }"
              />
              <button
                type="button"
                @click="showConfirm = !showConfirm"
                class="absolute right-5 top-1/2 -translate-y-1/2 text-cerulean-500 hover:text-cerulean-800 transition-colors"
                :aria-label="t('common.toggleConfirmPassword')"
              >
                <span class="material-symbols-outlined text-xl">
                  {{ showConfirm ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
            <InputError :message="confirmError" />
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full flex items-center justify-center gap-2 rounded-full py-4 text-base font-bold text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            style="background-color: #41778b"
          >
            <span v-if="isSubmitting" class="material-symbols-outlined text-xl animate-spin">progress_activity</span>
            <template v-else>
              {{ t('auth.resetPassword.submit') }}
              <span class="material-symbols-outlined text-xl">check_circle</span>
            </template>
          </button>
        </form>

        <p class="text-center text-sm text-cerulean-800/50">
          {{ t('auth.resetPassword.backPrompt') }}
          <router-link to="/login" class="text-cerulean-600 font-bold hover:text-cerulean-800 transition-colors ml-1">
            {{ t('auth.resetPassword.loginLink') }}
          </router-link>
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
