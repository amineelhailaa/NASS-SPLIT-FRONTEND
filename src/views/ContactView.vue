<script setup>
import NavBar from '@/components/NavBar.vue'
import AppFooter from '@/components/AppFooter.vue'
import { ref } from 'vue'

const form = ref({ email: '', object: '', message: '' })

function sendContactMessage() {
  // TODO
}
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
          <span class="text-cerulean-500 font-bold text-sm tracking-wide">Get in Touch</span>
        </div>
        <h1 class="text-6xl md:text-7xl font-extrabold tracking-tight leading-none">
          Contact <span class="text-cerulean-700">Us</span>
        </h1>
        <p class="text-xl text-cerulean-800/60 leading-relaxed max-w-xl">
          Have a question or need help? Fill out the form and we'll get back to you shortly.
        </p>
      </div>
    </section>

    <!-- Form -->
    <section class="px-16 pb-16">
      <form
        class="bg-white rounded-2xl px-12 py-12 flex flex-col gap-6"
        style="box-shadow: 0 8px 32px rgba(22, 100, 122, 0.06)"
        @submit.prevent="sendContactMessage"
      >
        <div class="flex flex-col gap-2">
          <label class="text-sm font-bold text-cerulean-800">Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="your@email.com"
            required
            class="w-full rounded-full border border-cerulean-200 bg-cerulean-50 px-6 py-3.5 text-base text-cerulean-800 placeholder:text-cerulean-800/30 outline-none focus:border-cerulean-500 focus:ring-2 focus:ring-cerulean-500/10 transition"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-bold text-cerulean-800">Object</label>
          <input
            v-model="form.object"
            type="text"
            placeholder="What is this about?"
            required
            class="w-full rounded-full border border-cerulean-200 bg-cerulean-50 px-6 py-3.5 text-base text-cerulean-800 placeholder:text-cerulean-800/30 outline-none focus:border-cerulean-500 focus:ring-2 focus:ring-cerulean-500/10 transition"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-bold text-cerulean-800">Message</label>
          <textarea
            v-model="form.message"
            placeholder="Write your message here..."
            required
            rows="6"
            class="w-full rounded-2xl border border-cerulean-200 bg-cerulean-50 px-6 py-4 text-base text-cerulean-800 placeholder:text-cerulean-800/30 outline-none focus:border-cerulean-500 focus:ring-2 focus:ring-cerulean-500/10 transition resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          class="self-start rounded-full px-10 py-4 text-base font-bold text-white shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          style="background-color: #41778b"
        >
          Send Message
        </button>
      </form>
    </section>

    <!-- Info Grid -->
    <section class="px-16 pb-24">
      <div class="grid md:grid-cols-3 gap-6">

        <!-- Call & WhatsApp -->
        <div
          class="bg-white rounded-2xl p-8 flex flex-col gap-5"
          style="box-shadow: 0 4px 20px rgba(22, 100, 122, 0.06)"
        >
          <div class="w-12 h-12 rounded-2xl bg-cerulean-500/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-cerulean-500">call</span>
          </div>
          <div class="flex flex-col gap-1">
            <h3 class="text-lg font-bold">Call & WhatsApp</h3>
            <p class="text-cerulean-800/60 text-sm">Reach us directly on phone or WhatsApp.</p>
          </div>
          <a
            href="tel:+212612887419"
            class="text-cerulean-600 font-bold text-lg hover:text-cerulean-800 transition-colors"
          >+212 612 887 419</a>
        </div>

        <!-- Working Hours -->
        <div
          class="bg-white rounded-2xl p-8 flex flex-col gap-5"
          style="box-shadow: 0 4px 20px rgba(22, 100, 122, 0.06)"
        >
          <div class="w-12 h-12 rounded-2xl bg-cerulean-500/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-cerulean-500">schedule</span>
          </div>
          <div class="flex flex-col gap-1">
            <h3 class="text-lg font-bold">Working Hours</h3>
            <p class="text-cerulean-800/60 text-sm">We're available during these hours.</p>
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-cerulean-800/70">Daily</span>
              <span class="text-sm font-bold text-cerulean-700">8:00 AM – 5:00 PM</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-cerulean-800/70">Weekend</span>
              <span class="inline-flex items-center rounded-full bg-red-50 px-3 py-0.5 text-xs font-bold text-red-400">Closed</span>
            </div>
          </div>
        </div>

        <!-- Write to Us -->
        <div
          class="bg-white rounded-2xl p-8 flex flex-col gap-5"
          style="box-shadow: 0 4px 20px rgba(22, 100, 122, 0.06)"
        >
          <div class="w-12 h-12 rounded-2xl bg-cerulean-500/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-cerulean-500">alternate_email</span>
          </div>
          <div class="flex flex-col gap-1">
            <h3 class="text-lg font-bold">Write to Us</h3>
            <p class="text-cerulean-800/60 text-sm">Send us an email anytime.</p>
          </div>
          <div class="flex flex-col gap-2">
            <a
              href="mailto:amineelhailaa@gmail.com"
              class="text-cerulean-600 font-semibold text-sm hover:text-cerulean-800 transition-colors break-all"
            >amineelhailaa@gmail.com</a>
            <a
              href="mailto:amine.elhilaa@student.youcode.ma"
              class="text-cerulean-600 font-semibold text-sm hover:text-cerulean-800 transition-colors break-all"
            >amine.elhilaa@student.youcode.ma</a>
          </div>
        </div>

      </div>
    </section>

    <AppFooter />
  </div>
</template>
