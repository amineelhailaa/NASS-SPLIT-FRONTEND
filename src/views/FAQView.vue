<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import NavBar from '@/components/NavBar.vue'
import AppFooter from '@/components/AppFooter.vue'

const { tm, rt } = useI18n()

const faqs = computed(() => tm('faq.items'))

const openIndex = ref(null)

function toggle(index) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <div
    class="relative flex flex-col overflow-x-hidden bg-cerulean-50 text-cerulean-800"
    style="font-family: 'Plus Jakarta Sans', sans-serif"
  >
    <NavBar />

    <!-- Hero -->
    <section class="relative px-16 pt-40 pb-20 overflow-hidden">
      <div class="absolute top-0 right-0 w-96 h-96 bg-cerulean-500/10 rounded-full blur-3xl -z-10"></div>
      <div class="absolute bottom-0 left-0 w-64 h-64 bg-cerulean-200/40 rounded-full blur-3xl -z-10"></div>
      <div class="flex flex-col gap-6">
        <div class="inline-flex w-fit items-center gap-2 rounded-full bg-cerulean-500/10 px-5 py-1.5">
          <span class="material-symbols-outlined text-cerulean-500 text-lg">help_center</span>
          <span class="text-cerulean-500 font-bold text-sm tracking-wide">{{ $t('faq.hero.badge') }}</span>
        </div>
        <h1 class="text-6xl md:text-7xl font-extrabold tracking-tight leading-none">
          {{ $t('faq.hero.titleL1') }}<br />
          <span class="text-cerulean-700">{{ $t('faq.hero.titleL2') }}</span>
        </h1>
        <p class="text-xl text-cerulean-800/60 leading-relaxed max-w-2xl">
          {{ $t('faq.hero.subtitle') }}
        </p>
      </div>
    </section>

    <!-- FAQ Accordion -->
    <section class="px-16 pb-24">
      <div class="flex flex-col gap-4">
        <div
          v-for="(faq, index) in faqs"
          :key="index"
          class="bg-white rounded-2xl overflow-hidden transition-all duration-300"
          :style="{ boxShadow: openIndex === index ? '0 12px 40px rgba(22, 100, 122, 0.10)' : '0 4px 20px rgba(22, 100, 122, 0.06)' }"
        >
          <button
            class="w-full flex items-center justify-between gap-6 px-8 py-6 text-left cursor-pointer"
            @click="toggle(index)"
          >
            <span class="text-lg font-bold text-cerulean-800">{{ rt(faq.question) }}</span>
            <span
              class="material-symbols-outlined text-cerulean-500 shrink-0 transition-transform duration-300"
              :class="openIndex === index ? 'rotate-180' : ''"
            >expand_more</span>
          </button>

          <div
            v-show="openIndex === index"
            class="px-8 pb-8 flex flex-col gap-4"
          >
            <p class="text-cerulean-800/70 leading-relaxed text-base">{{ rt(faq.answer) }}</p>
            <div v-if="faq.tags && faq.tags.length" class="flex flex-wrap gap-2">
              <span
                v-for="(tag, i) in faq.tags"
                :key="i"
                class="inline-flex items-center rounded-full bg-cerulean-500/10 px-4 py-1 text-sm font-semibold text-cerulean-600"
              >{{ rt(tag) }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Still have questions -->
    <section class="px-16 pb-24">
      <div
        class="rounded-2xl px-12 py-14 flex flex-col md:flex-row items-center justify-between gap-8"
        style="background-color: #bc7f4a; box-shadow: 0 8px 32px rgba(188, 127, 74, 0.20)"
      >
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-white">support_agent</span>
            </div>
            <h2 class="text-3xl font-bold text-white">{{ $t('faq.stillHaveQuestions.title') }}</h2>
          </div>
          <p class="text-white/80 text-lg">{{ $t('faq.stillHaveQuestions.subtitle') }}</p>
        </div>
        <button
          class="shrink-0 rounded-full px-10 py-4 text-base font-bold bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
          style="color: #bc7f4a"
        ><router-link to="contact">
          {{ $t('faq.stillHaveQuestions.button') }}
        </router-link></button>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="mb-24 px-10 py-20 text-center relative overflow-hidden bg-cerulean-800">
      <div class="relative z-10 flex flex-col gap-8 items-center">
        <h2 class="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          {{ $t('faq.bottomCta.title') }}
        </h2>
        <button
          class="bg-white text-cerulean-700 font-bold px-10 py-4 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          {{ $t('faq.bottomCta.button') }}
        </button>
      </div>
    </section>

    <AppFooter />
  </div>
</template>
