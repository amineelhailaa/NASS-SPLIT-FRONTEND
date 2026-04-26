<script setup>
import { ref, computed } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.js'
import InputError from '@/components/inputError.vue'
import logoRaw from '@/assets/logo.svg?raw'
import api from '@/lib/axios.js'

const router = useRouter()
const route = useRoute();
const auth = useAuthStore()
const { t } = useI18n()

const schema = yup.object({
  email: yup.string().required(t('auth.login.errors.emailRequired')).email(t('auth.login.errors.emailInvalid')),
  password: yup.string().required(t('auth.login.errors.passwordRequired')).min(8, t('auth.login.errors.passwordMin')),
})

const { handleSubmit, setErrors, isSubmitting } = useForm({ validationSchema: schema })
const { value: email, errorMessage: emailError } = useField('email')
const { value: password, errorMessage: passwordError } = useField('password')

const showPassword = ref(false)

const features = computed(() => [
  {
    icon: 'call_split',
    title: t('auth.login.features.smartSplitting.title'),
    desc: t('auth.login.features.smartSplitting.desc'),
  },
  {
    icon: 'account_balance_wallet',
    title: t('auth.login.features.optimalSettlements.title'),
    desc: t('auth.login.features.optimalSettlements.desc'),
  },
  {
    icon: 'shield',
    title: t('auth.login.features.encryption.title'),
    desc: t('auth.login.features.encryption.desc'),
  },
])

const copyrightYear = new Date().getFullYear()

const handleLogin = handleSubmit(async (values) => {
  try {
    await auth.login(values)
    const redirect = route.query.redirect || '/'
    console.log(redirect)
    await router.push(redirect)
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

const googleLogin = async () => {
  const { data } = await api.get('/api/auth/google/redirect')
  window.location.href = data.data.url
}

const githubLogin = async () => {
  const { data } = await api.get('/api/auth/github/redirect')
  window.location.href = data.data.url
}
</script>

<template>
  <div
    class="min-h-screen flex bg-cerulean-50"
    style="font-family: 'Plus Jakarta Sans', sans-serif"
  >
    <!-- Mobile top bar -->
    <div class="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md"
      style="box-shadow: 0 2px 16px rgba(22,100,122,0.06)">
      <router-link to="/" class="flex items-center gap-2">
        <div class="logo-inject w-9 h-9 overflow-hidden shrink-0" v-html="logoRaw" />
        <span class="text-cerulean-800 text-base font-bold tracking-wide">{{ t('brand.name') }}</span>
      </router-link>
      <router-link to="/" class="flex items-center gap-1 text-sm font-semibold text-cerulean-600 hover:text-cerulean-800 transition-colors">
        <span class="material-symbols-outlined text-base">arrow_back</span>
        {{ t('common.home') }}
      </router-link>
    </div>

    <!-- Left panel: brand -->
    <div class="hidden lg:flex flex-col justify-between w-[50%] bg-cerulean-800 px-16 py-14 relative overflow-hidden">
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-cerulean-700/50 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-cerulean-600/30 rounded-full blur-3xl"></div>

      <router-link to="/" class="relative z-10 flex items-center gap-3 w-fit">
        <div class="logo-inject w-12 h-12 overflow-hidden shrink-0" v-html="logoRaw" />
        <span class="text-white text-xl font-bold tracking-wide">{{ t('brand.name') }}</span>
      </router-link>

      <div class="relative z-10 flex flex-col gap-10">
        <div class="flex flex-col gap-4">
          <h2 class="text-5xl font-extrabold text-white leading-tight">
            {{ t('auth.login.brandTitleL1') }}<br />{{ t('auth.login.brandTitleL2') }}
          </h2>
          <p class="text-white/60 text-lg leading-relaxed">
            {{ t('auth.login.brandSubtitle') }}
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

      <p class="relative z-10 text-white/30 text-xs">
        {{ t('common.copyright', { year: copyrightYear }) }}
      </p>
    </div>

    <!-- Right panel: form -->
    <div class="flex flex-1 items-center justify-center px-8 md:px-16 py-14 pt-28 lg:pt-14">
      <div class="w-full max-w-md flex flex-col gap-10">

        <div class="flex flex-col gap-2">
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-cerulean-800">
            {{ t('auth.login.title') }}
          </h1>
          <p class="text-cerulean-800/50 text-lg">{{ t('auth.login.subtitle') }}</p>
        </div>

        <form @submit.prevent="handleLogin" class="flex flex-col gap-5">

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-bold text-cerulean-800">{{ t('common.emailAddress') }}</label>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none">mail</span>
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

          <div class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-cerulean-800">{{ t('common.password') }}</label>
              <router-link to="/forgot-password" class="text-sm text-cerulean-500 font-semibold hover:text-cerulean-700 transition-colors">{{ t('auth.login.forgot') }}</router-link>
            </div>
            <div class="relative">
              <span class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-cerulean-500 text-xl pointer-events-none">lock</span>
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

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full flex items-center justify-center gap-2 rounded-full py-4 text-base font-bold text-white shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            style="background-color: #41778b"
          >
            <span v-if="isSubmitting" class="material-symbols-outlined text-xl animate-spin">progress_activity</span>
            <template v-else>
              {{ t('auth.login.submit') }}
              <span class="material-symbols-outlined text-xl">arrow_forward</span>
            </template>
          </button>
        </form>

        <div class="flex items-center gap-4">
          <div class="flex-1 h-px bg-cerulean-200"></div>
          <span class="text-sm text-cerulean-800/40 font-medium">{{ t('auth.login.divider') }}</span>
          <div class="flex-1 h-px bg-cerulean-200"></div>
        </div>

        <div class="flex gap-3">
          <button @click="googleLogin()"
            class="flex-1 flex items-center justify-center gap-2 bg-white rounded-full py-3.5 text-sm font-semibold text-cerulean-800 hover:shadow-md transition-all cursor-pointer"
            style="box-shadow: 0 2px 12px rgba(22, 100, 122, 0.08)"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {{ t('auth.login.google') }}
          </button>
          <button @click="githubLogin()"
            class="flex-1 flex items-center justify-center gap-2 bg-white rounded-full py-3.5 text-sm font-semibold text-cerulean-800 hover:shadow-md transition-all cursor-pointer"
            style="box-shadow: 0 2px 12px rgba(22, 100, 122, 0.08)"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            {{ t('auth.login.github') }}
          </button>
        </div>

        <p class="text-center text-sm text-cerulean-800/50">
          {{ t('auth.login.signupPrompt') }}
          <router-link to="/signup" class="text-cerulean-600 font-bold hover:text-cerulean-800 transition-colors ml-1">{{ t('auth.login.signupLink') }}</router-link>
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
