<script setup>
import AppFooter from '@/components/AppFooter.vue'
</script>

<template>
  <div
    class="relative flex flex-col overflow-x-hidden bg-cerulean-50 text-slate-900"
    style="font-family: 'Plus Jakarta Sans', sans-serif"
  >
    <!-- Hero Section -->
    <section
      class="relative flex min-h-[80vh] items-center justify-center pt-32 pb-40 px-12 overflow-hidden"
    >
      <div class="flex flex-col gap-8 text-center w-full justify-center items-center">
        <img src="@/assets/logo.png" height="300" width="300" alt="logo" />
        <div
          class="inline-flex w-fit self-center rounded-full bg-cerulean-500/10 px-4 py-1.5 text-sm font-bold text-cerulean-500"
        >
          Simplify group expenses
        </div>
        <h1
          class="text-5xl font-extrabold leading-[1.1] tracking-tight text-cerulean-800 md:text-6xl"
        >
          Focus on the fun, we'll do the math.
        </h1>
        <p class="text-lg leading-relaxed text-cerulean-800/80">
          NASS SPLIT is more than a calculator. It's a digital trusted third party that centralizes
          your expenses and instantly calculates who owes what.
        </p>
        <div class="flex flex-col gap-4 sm:flex-row justify-center">
          <button
            class="rounded-full cursor-pointer bg-cerulean-500 px-8 py-4 text-lg font-bold text-white shadow-xl hover:scale-102 transition-transform"
          >
            Create a group for free
          </button>
          <button
            class="cursor-pointer flex items-center justify-center gap-2 rounded-full border-2 border-cerulean-500/20 hover:scale-102 bg-white px-8 py-4 text-lg font-bold text-cerulean-500 hover:bg-cerulean-500/5 transition-colors"
          >
            <span class="material-symbols-outlined">play_circle</span>
            Watch demo
          </button>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="bg-white py-36 px-16 flex flex-col gap-6">
      <div class="flex flex-col gap-6 text-center pb-20">
        <h2 class="text-4xl font-extrabold text-cerulean-800 md:text-5xl">
          Goodbye awkwardness, hello transparency
        </h2>
        <p class="text-lg text-cerulean-800/60">
          A solution designed to simplify community life without the usual money-related frictions.
        </p>
      </div>
      <div class="grid gap-10 md:grid-cols-2">
        <div
          class="group flex flex-col gap-5 rounded-2xl bg-cerulean-50 p-10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
        >
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-cerulean-500 shadow-sm">
            <span class="material-symbols-outlined text-4xl">sentiment_very_satisfied</span>
          </div>
          <h3 class="text-2xl font-bold text-cerulean-800">No more awkwardness</h3>
          <p class="text-cerulean-800/70 leading-relaxed">
            No more lost post-it notes or awkward money requests via text. Everything is clear,
            documented, and visible to everyone in real-time.
          </p>
        </div>
        <div
          class="group flex flex-col gap-5 rounded-2xl bg-cerulean-50 p-10 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
        >
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-cerulean-500 shadow-sm">
            <span class="material-symbols-outlined text-4xl">groups</span>
          </div>
          <h3 class="text-2xl font-bold text-cerulean-800">For everyone</h3>
          <p class="text-cerulean-800/70 leading-relaxed">
            Whether you're a meticulous organizer or a participant following along, the intuitive
            interface adapts to all levels of tech-savviness.
          </p>
        </div>
      </div>
    </section>

    <!-- How it Works -->
    <section class="py-36 px-16">
      <div class="flex flex-col gap-6 text-center pb-20">
        <h2 class="text-4xl font-extrabold text-cerulean-800 md:text-5xl">How it works?</h2>
        <p class="text-lg text-cerulean-800/60">Manage your group expenses in 3 ultra-simple steps.</p>
      </div>
      <div class="grid gap-16 lg:grid-cols-3">
        <div class="flex flex-col items-center text-center gap-6">
          <div
            class="flex h-20 w-20 items-center justify-center rounded-full bg-cerulean-500 text-white text-3xl font-black shadow-lg"
          >
            1
          </div>
          <h4 class="text-xl font-bold text-cerulean-800">Add an expense</h4>
          <p class="text-cerulean-800/70">
            Enter the amount and snap a photo of the receipt. Your proofs are archived and
            accessible in one click.
          </p>
          <div class="flex h-40 w-full items-center justify-center rounded-2xl bg-white shadow-sm">
            <span class="material-symbols-outlined text-6xl text-cerulean-500">receipt_long</span>
          </div>
        </div>
        <div class="flex flex-col items-center text-center gap-6">
          <div
            class="flex h-20 w-20 items-center justify-center rounded-full bg-cerulean-500 text-white text-3xl font-black shadow-lg"
          >
            2
          </div>
          <h4 class="text-xl font-bold text-cerulean-800">Smart Distribution</h4>
          <p class="text-cerulean-800/70">
            Split costs fairly, by percentage, or exclude certain members depending on the situation.
          </p>
          <div class="flex h-40 w-full items-center justify-center rounded-2xl bg-white shadow-sm">
            <span class="material-symbols-outlined text-6xl text-cerulean-500">call_split</span>
          </div>
        </div>
        <div class="flex flex-col items-center text-center gap-6">
          <div
            class="flex h-20 w-20 items-center justify-center rounded-full bg-cerulean-500 text-white text-3xl font-black shadow-lg"
          >
            3
          </div>
          <h4 class="text-xl font-bold text-cerulean-800">Instant Tracking</h4>
          <p class="text-cerulean-800/70">
            Everyone's balance is recalculated instantly. You know exactly who needs to repay whom,
            at any time.
          </p>
          <div class="flex h-40 w-full items-center justify-center rounded-2xl bg-white shadow-sm">
            <span class="material-symbols-outlined text-6xl text-cerulean-500">monitoring</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="bg-cerulean-800 px-16 py-20 text-white">
      <div class="flex flex-col gap-4 pb-10">
        <h2 class="text-4xl font-extrabold md:text-5xl">Everything you need</h2>
        <p class="text-lg text-white/70">More than just a split, a complete management platform.</p>
      </div>
      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div
          class="flex flex-col gap-4 rounded-2xl bg-white/10 p-8 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors"
        >
          <span class="material-symbols-outlined text-cerulean-500 text-4xl">category</span>
          <h5 class="text-xl font-bold">Categories</h5>
          <p class="text-sm text-white/70">
            Classify your expenses by type (Leisure, Groceries, Transport) for better analysis.
          </p>
        </div>
        <div
          class="flex flex-col gap-4 rounded-2xl bg-white/10 p-8 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors"
        >
          <span class="material-symbols-outlined text-cerulean-500 text-4xl">forum</span>
          <h5 class="text-xl font-bold">Messaging</h5>
          <p class="text-sm text-white/70">Discuss a specific expense directly within the application.</p>
        </div>
        <div
          class="flex flex-col gap-4 rounded-2xl bg-white/10 p-8 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors"
        >
          <span class="material-symbols-outlined text-cerulean-500 text-4xl">notifications_active</span>
          <h5 class="text-xl font-bold">Reminders</h5>
          <p class="text-sm text-white/70">Automatic notifications for pending bills and repayments.</p>
        </div>
        <div
          class="flex flex-col gap-4 rounded-2xl bg-white/10 p-8 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors"
        >
          <span class="material-symbols-outlined text-cerulean-500 text-4xl">sync</span>
          <h5 class="text-xl font-bold">Real-time Updates</h5>
          <p class="text-sm text-white/70">Instant balance calculation and notifications.</p>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="bg-cerulean-50 py-36 px-16">
      <div class="flex flex-col gap-8 items-center text-center">
        <h2 class="text-5xl font-extrabold text-cerulean-800">
          Ready to simplify your expenses?
        </h2>
        <p class="text-lg text-cerulean-800/60">
          Join thousands of users who have already said goodbye to complex calculations and money tensions.
        </p>
        <button
          class="rounded-full bg-cerulean-500 px-12 py-5 text-xl font-extrabold text-white shadow-xl hover:scale-105 transition-transform cursor-pointer"
        >
          Create my group for free
        </button>
      </div>
    </section>

    <AppFooter />
  </div>
</template>
