<script setup>
const year = new Date().getFullYear()
</script>

<template>
  <footer class="bg-cerulean-800 text-white pt-20 pb-10 px-16">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-12 pb-10">
      <!-- Brand -->
      <div class="col-span-2 md:col-span-1 flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <img src="@/assets/logo.svg" class="h-10 w-10">
          <span class="text-xl font-bold">Nass Split</span>
        </div>
        <p class="text-sm text-white/50 leading-relaxed">
          {{ $t('footer.tagline') }}
        </p>
      </div>

      <!-- Product -->
      <div class="flex flex-col gap-4">
        <h6 class="text-sm font-bold uppercase tracking-widest text-white/40">{{ $t('footer.product.title') }}</h6>
        <ul class="flex flex-col gap-3">
          <li><a href="#" class="text-sm text-white/70 hover:text-white transition-colors">{{ $t('footer.product.features') }}</a></li>
          <li><a href="#" class="text-sm text-white/70 hover:text-white transition-colors">{{ $t('footer.product.howItWorks') }}</a></li>
          <li><a href="#" class="text-sm text-white/70 hover:text-white transition-colors">{{ $t('footer.product.pricing') }}</a></li>
          <li><a href="#" class="text-sm text-white/70 hover:text-white transition-colors">{{ $t('footer.product.changelog') }}</a></li>
        </ul>
      </div>

      <!-- Company -->
      <div class="flex flex-col gap-4">
        <h6 class="text-sm font-bold uppercase tracking-widest text-white/40">{{ $t('footer.company.title') }}</h6>
        <ul class="flex flex-col gap-3">
          <li><a href="#" class="text-sm text-white/70 hover:text-white transition-colors">{{ $t('footer.company.about') }}</a></li>
          <li><a href="#" class="text-sm text-white/70 hover:text-white transition-colors">{{ $t('footer.company.blog') }}</a></li>
          <li><a href="#" class="text-sm text-white/70 hover:text-white transition-colors">{{ $t('footer.company.careers') }}</a></li>
          <li><a href="#" class="text-sm text-white/70 hover:text-white transition-colors">{{ $t('footer.company.contact') }}</a></li>
        </ul>
      </div>

      <!-- Legal -->
      <div class="flex flex-col gap-4">
        <h6 class="text-sm font-bold uppercase tracking-widest text-white/40">{{ $t('footer.legal.title') }}</h6>
        <ul class="flex flex-col gap-3">
          <li><a href="#" class="text-sm text-white/70 hover:text-white transition-colors">{{ $t('footer.legal.terms') }}</a></li>
          <li><a href="#" class="text-sm text-white/70 hover:text-white transition-colors">{{ $t('footer.legal.privacy') }}</a></li>
          <li><a href="#" class="text-sm text-white/70 hover:text-white transition-colors">{{ $t('footer.legal.cookies') }}</a></li>
          <li><a href="#" class="text-sm text-white/70 hover:text-white transition-colors">{{ $t('footer.legal.gdpr') }}</a></li>
        </ul>
      </div>
    </div>

    <div class="border-t border-white/10 pt-8">
      <p class="text-sm text-white/40">{{ $t('footer.rights', { year }) }}</p>
    </div>
  </footer>
</template>
