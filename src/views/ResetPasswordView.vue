<script setup>
import { ref } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useRouter, useRoute } from 'vue-router'
import InputError from '@/components/inputError.vue'
import logoRaw from '@/assets/logo.svg?raw'
import api from '@/lib/axios.js'

const router = useRouter()
const route = useRoute()

// token comes from the route param, email from the query string
const token = route.params.token ?? ''
const emailFromUrl = route.query.email ?? ''

const showPassword = ref(false)
const showConfirm = ref(false)

const schema = yup.object({
  email: yup.string().required('Email is required').email('Invalid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Minimum 8 characters'),
  password_confirmation: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
})

const { handleSubmit, setErrors, isSubmitting } = useForm({
  validationSchema: schema,
  initialValues: { email: emailFromUrl },
})

const { value: email, errorMessage: emailError } = useField('email')
const { value: password, errorMessage: passwordError } = useField('password')
const { value: password_confirmation, errorMessage: confirmError } = useField('password_confirmation')

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
      setErrors({ email: 'Too many attempts. Please wait before retrying.' })
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
        <span class="text-cerulean-800 text-base font-bold tracking-wide">NASS SPLIT</span>
      </router-link>
      <router-link
        to="/login"
        class="flex items-center gap-1 text-sm font-semibold text-cerulean-600 hover:text-cerulean-800 transition-colors"
      >
        <span class="material-symbols-outlined text-base">arrow_back</span>
        Login
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
        <span class="text-white text-xl font-bold tracking-wide">NASS SPLIT</span>
      </router-link>

      <div class="relative z-10 flex flex-col gap-6">
        <div class="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center">
          <span class="material-symbols-outlined text-white text-3xl">shield_lock</span>
        </div>
        <div class="flex flex-col gap-4">
          <h2 class="text-5xl font-extrabold text-white leading-tight">
            Set a new<br />password.
          </h2>
          <p class="text-white/60 text-lg leading-relaxed">
            Choose a strong password to keep your account secure.
          </p>
        </div>
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
            <span class="material-symbols-outlined text-white text-xl">password</span>
            <p class="text-white/70 text-sm">Use at least 8 characters with a mix of letters and numbers.</p>
          </div>
          <div class="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
            <span class="material-symbols-outlined text-white text-xl">devices</span>
            <p class="text-white/70 text-sm">You'll be logged out of all other devices after resetting.</p>
          </div>
        </div>
      </div>

      <p class="relative z-10 text-white/30 text-xs">© 2026 Nass Split · YouCode</p>
    </div>

    <!-- Right form panel -->
    <div class="flex flex-1 items-center justify-center px-8 md:px-16 py-14 pt-28 lg:pt-14">
      <div class="w-full flex flex-col gap-10">

        <!-- Header -->
        <div class="flex flex-col gap-2">
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-cerulean-800">
            New Password
          </h1>
          <p class="text-cerulean-800/50 text-lg">Create a strong password for your account.</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleReset" class="flex flex-col gap-5">

          <!-- Email (read-only when pre-filled) -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-cerulean-800">Email Address</label>
            <div class="relative">
              <span
                class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none"
              >mail</span>
              <input
                type="email"
                placeholder="your@email.com"
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
            <label class="text-sm font-bold text-cerulean-800">New Password</label>
            <div class="relative">
              <span
                class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none"
              >lock</span>
              <input
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                v-model="password"
                class="w-full bg-cerulean-100 text-cerulean-800 placeholder:text-cerulean-800/30 rounded-full pl-12 pr-12 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition"
                :class="{ 'ring-2 ring-red-400/50 bg-red-50': passwordError }"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-5 top-1/2 -translate-y-1/2 text-cerulean-500 hover:text-cerulean-800 transition-colors"
                aria-label="Toggle password visibility"
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
            <label class="text-sm font-bold text-cerulean-800">Confirm Password</label>
            <div class="relative">
              <span
                class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none"
              >lock_clock</span>
              <input
                :type="showConfirm ? 'text' : 'password'"
                placeholder="••••••••"
                v-model="password_confirmation"
                class="w-full bg-cerulean-100 text-cerulean-800 placeholder:text-cerulean-800/30 rounded-full pl-12 pr-12 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition"
                :class="{ 'ring-2 ring-red-400/50 bg-red-50': confirmError }"
              />
              <button
                type="button"
                @click="showConfirm = !showConfirm"
                class="absolute right-5 top-1/2 -translate-y-1/2 text-cerulean-500 hover:text-cerulean-800 transition-colors"
                aria-label="Toggle confirm password visibility"
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
              Reset Password
              <span class="material-symbols-outlined text-xl">check_circle</span>
            </template>
          </button>
        </form>

        <p class="text-center text-sm text-cerulean-800/50">
          Back to
          <router-link to="/login" class="text-cerulean-600 font-bold hover:text-cerulean-800 transition-colors ml-1">
            Login
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
