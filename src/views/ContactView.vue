<script setup>
import NavBar from '@/components/NavBar.vue'
import AppFooter from '@/components/AppFooter.vue'
import InputError from '@/components/inputError.vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/lib/axios.js'

const { t } = useI18n()

const success = ref(false)

const schema = yup.object({
  name:    yup.string().required(t('contact.form.errors.nameRequired')).max(100),
  email:   yup.string().required(t('contact.form.errors.emailRequired')).email(t('contact.form.errors.emailInvalid')),
  subject: yup.string().required(t('contact.form.errors.subjectRequired')).max(150),
  message: yup.string().required(t('contact.form.errors.messageRequired')).max(2000),
})

const { handleSubmit, setErrors, isSubmitting, resetForm } = useForm({ validationSchema: schema })
const { value: name,    errorMessage: nameError    } = useField('name')
const { value: email,   errorMessage: emailError   } = useField('email')
const { value: subject, errorMessage: subjectError } = useField('subject')
const { value: message, errorMessage: messageError } = useField('message')

const send = handleSubmit(async (values) => {
  success.value = false
  try {
    await api.post('/api/v1/contact-messages', values)
    success.value = true
    resetForm()
  } catch (err) {
    if (err.response?.status === 422) {
      const errs = {}
      for (const [field, msgs] of Object.entries(err.response.data.errors ?? {})) {
        errs[field] = msgs[0]
      }
      setErrors(errs)
    } else if (err.response?.status === 429) {
      setErrors({ name: t('contact.form.errors.rateLimited') })
    }
  }
})
</script>

<template>
  <div
    class="relative flex flex-col overflow-x-hidden bg-cerulean-50 text-cerulean-800"
    style="font-family: 'Plus Jakarta Sans', sans-serif"
  >
    <NavBar />

    <!-- Hero -->
    <section class="relative px-16 pt-40 pb-16 overflow-hidden">
      <div class="absolute top-0 right-0 w-96 h-96 bg-cerulean-500/10 rounded-full blur-3xl -z-10"></div>
      <div class="flex flex-col gap-6">
        <div class="inline-flex w-fit items-center gap-2 rounded-full bg-cerulean-500/10 px-5 py-1.5">
          <span class="material-symbols-outlined text-cerulean-500 text-lg">mail</span>
          <span class="text-cerulean-500 font-bold text-sm tracking-wide">{{ t('contact.hero.badge') }}</span>
        </div>
        <h1 class="text-6xl md:text-7xl font-extrabold tracking-tight leading-none">
          {{ t('contact.hero.titleL1') }} <span class="text-cerulean-700">{{ t('contact.hero.titleL2') }}</span>
        </h1>
        <p class="text-xl text-cerulean-800/60 leading-relaxed max-w-xl">
          {{ t('contact.hero.subtitle') }}
        </p>
      </div>
    </section>

    <!-- Form -->
    <section class="px-16 pb-16">
      <div
        v-if="success"
        class="mb-6 flex items-center gap-3 bg-cerulean-100 rounded-2xl px-6 py-4"
      >
        <span class="material-symbols-outlined text-cerulean-600 text-xl shrink-0">check_circle</span>
        <p class="text-cerulean-800 font-medium text-sm">
          {{ t('contact.form.success') }}
        </p>
      </div>

      <form
        class="bg-white rounded-2xl px-12 py-12 flex flex-col gap-6"
        style="box-shadow: 0 8px 32px rgba(22, 100, 122, 0.06)"
        @submit.prevent="send"
      >
        <div class="grid md:grid-cols-2 gap-6">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-bold text-cerulean-800">{{ t('contact.form.name') }}</label>
            <input
              v-model="name"
              type="text"
              :placeholder="t('contact.form.namePlaceholder')"
              class="w-full rounded-full bg-cerulean-50 px-6 py-3.5 text-base text-cerulean-800 placeholder:text-cerulean-800/30 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition"
              :class="{ 'ring-2 ring-red-400/50 bg-red-50': nameError }"
            />
            <InputError :message="nameError" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-bold text-cerulean-800">{{ t('contact.form.email') }}</label>
            <input
              v-model="email"
              type="email"
              :placeholder="t('common.emailPlaceholder')"
              class="w-full rounded-full bg-cerulean-50 px-6 py-3.5 text-base text-cerulean-800 placeholder:text-cerulean-800/30 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition"
              :class="{ 'ring-2 ring-red-400/50 bg-red-50': emailError }"
            />
            <InputError :message="emailError" />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-bold text-cerulean-800">{{ t('contact.form.subject') }}</label>
          <input
            v-model="subject"
            type="text"
            :placeholder="t('contact.form.subjectPlaceholder')"
            class="w-full rounded-full bg-cerulean-50 px-6 py-3.5 text-base text-cerulean-800 placeholder:text-cerulean-800/30 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition"
            :class="{ 'ring-2 ring-red-400/50 bg-red-50': subjectError }"
          />
          <InputError :message="subjectError" />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-bold text-cerulean-800">{{ t('contact.form.message') }}</label>
          <textarea
            v-model="message"
            :placeholder="t('contact.form.messagePlaceholder')"
            rows="6"
            class="w-full rounded-2xl bg-cerulean-50 px-6 py-4 text-base text-cerulean-800 placeholder:text-cerulean-800/30 outline-none focus:bg-white focus:ring-2 focus:ring-cerulean-500/30 transition resize-none"
            :class="{ 'ring-2 ring-red-400/50 bg-red-50': messageError }"
          ></textarea>
          <InputError :message="messageError" />
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="self-start rounded-full px-10 py-4 text-base font-bold text-white shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-2"
          style="background-color: #41778b"
        >
          <span v-if="isSubmitting" class="material-symbols-outlined text-xl animate-spin">progress_activity</span>
          <template v-else>
            {{ t('contact.form.submit') }}
            <span class="material-symbols-outlined text-xl">send</span>
          </template>
        </button>
      </form>
    </section>

    <!-- Info Grid -->
    <section class="px-16 pb-24">
      <div class="grid md:grid-cols-3 gap-6">

        <div
          class="bg-white rounded-2xl p-8 flex flex-col gap-5"
          style="box-shadow: 0 4px 20px rgba(22, 100, 122, 0.06)"
        >
          <div class="w-12 h-12 rounded-2xl bg-cerulean-500/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-cerulean-500">call</span>
          </div>
          <div class="flex flex-col gap-1">
            <h3 class="text-lg font-bold">{{ t('contact.info.call.title') }}</h3>
            <p class="text-cerulean-800/60 text-sm">{{ t('contact.info.call.desc') }}</p>
          </div>
          <a href="tel:+212612887419" class="text-cerulean-600 font-bold text-lg hover:text-cerulean-800 transition-colors">
            +212 612 887 419
          </a>
        </div>

        <div
          class="bg-white rounded-2xl p-8 flex flex-col gap-5"
          style="box-shadow: 0 4px 20px rgba(22, 100, 122, 0.06)"
        >
          <div class="w-12 h-12 rounded-2xl bg-cerulean-500/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-cerulean-500">schedule</span>
          </div>
          <div class="flex flex-col gap-1">
            <h3 class="text-lg font-bold">{{ t('contact.info.hours.title') }}</h3>
            <p class="text-cerulean-800/60 text-sm">{{ t('contact.info.hours.desc') }}</p>
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-cerulean-800/70">{{ t('contact.info.hours.daily') }}</span>
              <span class="text-sm font-bold text-cerulean-700">{{ t('contact.info.hours.dailyHours') }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-cerulean-800/70">{{ t('contact.info.hours.weekend') }}</span>
              <span class="inline-flex items-center rounded-full bg-red-50 px-3 py-0.5 text-xs font-bold text-red-400">{{ t('contact.info.hours.closed') }}</span>
            </div>
          </div>
        </div>

        <div
          class="bg-white rounded-2xl p-8 flex flex-col gap-5"
          style="box-shadow: 0 4px 20px rgba(22, 100, 122, 0.06)"
        >
          <div class="w-12 h-12 rounded-2xl bg-cerulean-500/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-cerulean-500">alternate_email</span>
          </div>
          <div class="flex flex-col gap-1">
            <h3 class="text-lg font-bold">{{ t('contact.info.email.title') }}</h3>
            <p class="text-cerulean-800/60 text-sm">{{ t('contact.info.email.desc') }}</p>
          </div>
          <div class="flex flex-col gap-2">
            <a href="mailto:amineelhailaa@gmail.com" class="text-cerulean-600 font-semibold text-sm hover:text-cerulean-800 transition-colors break-all">amineelhailaa@gmail.com</a>
            <a href="mailto:amine.elhilaa@student.youcode.ma" class="text-cerulean-600 font-semibold text-sm hover:text-cerulean-800 transition-colors break-all">amine.elhilaa@student.youcode.ma</a>
          </div>
        </div>

      </div>
    </section>

    <AppFooter />
  </div>
</template>
