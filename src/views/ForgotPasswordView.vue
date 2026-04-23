<script setup>
import { ref } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import InputError from '@/components/inputError.vue'
import logoRaw from '@/assets/logo.svg?raw'
import api from '@/lib/axios.js'

const successMessage = ref('')

const schema = yup.object({
  email: yup.string().required('Email is required').email('Invalid email address'),
})

const { handleSubmit, setErrors, isSubmitting } = useForm({ validationSchema: schema })
const { value: email, errorMessage: emailError } = useField('email')

const handleSubmitForm = handleSubmit(async (values) => {
  successMessage.value = ''
  try {
    await api.get('/sanctum/csrf-cookie')
    const { data } = await api.post('/forgot-password', values)
    successMessage.value = data.status ?? 'Reset link sent! Check your inbox.'
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
          <span class="material-symbols-outlined text-white text-3xl">lock_reset</span>
        </div>
        <div class="flex flex-col gap-4">
          <h2 class="text-5xl font-extrabold text-white leading-tight">
            Reset your<br />password.
          </h2>
          <p class="text-white/60 text-lg leading-relaxed">
            Enter your email and we'll send a secure link to set a new password.
          </p>
        </div>
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
            <span class="material-symbols-outlined text-white text-xl">mark_email_read</span>
            <p class="text-white/70 text-sm">Check your spam folder if you don't see it within a few minutes.</p>
          </div>
          <div class="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4">
            <span class="material-symbols-outlined text-white text-xl">schedule</span>
            <p class="text-white/70 text-sm">The reset link expires after 60 minutes for your security.</p>
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
            Forgot Password?
          </h1>
          <p class="text-cerulean-800/50 text-lg">No worries — we'll send you a reset link.</p>
        </div>

        <!-- Success banner -->
        <div
          v-if="successMessage"
          class="flex items-start gap-3 bg-cerulean-100 rounded-2xl px-5 py-4"
        >
          <span class="material-symbols-outlined text-cerulean-600 text-xl mt-0.5 shrink-0">check_circle</span>
          <p class="text-cerulean-800 text-sm font-medium">{{ successMessage }}</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmitForm" class="flex flex-col gap-5">
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
                class="w-full bg-cerulean-100 text-cerulean-800 placeholder:text-cerulean-800/30 rounded-full pl-12 pr-6 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition"
                :class="{ 'ring-2 ring-red-400/50 bg-red-50': emailError }"
              />
            </div>
            <InputError :message="emailError" />
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full flex items-center justify-center gap-2 rounded-full py-4 text-base font-bold text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            style="background-color: #41778b"
          >
            <span v-if="isSubmitting" class="material-symbols-outlined text-xl animate-spin">progress_activity</span>
            <template v-else>
              Send Reset Link
              <span class="material-symbols-outlined text-xl">send</span>
            </template>
          </button>
        </form>

        <p class="text-center text-sm text-cerulean-800/50">
          Remembered it?
          <router-link to="/login" class="text-cerulean-600 font-bold hover:text-cerulean-800 transition-colors ml-1">
            Back to Login
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