<template>
  <div class="min-h-screen bg-brand-background flex flex-col items-center justify-center px-6">
    <h1 class="text-8xl font-bold text-brand-primary mb-4">404</h1>
    <p class="text-2xl font-semibold text-brand-text mb-2">{{ $t('notFound.title') }}</p>
    <p class="text-brand-textSecondary mb-8">{{ $t('notFound.subtitle') }}</p>
    <RouterLink
      to="/"
      class="px-6 py-3 rounded-full bg-brand-primary text-white font-semibold"
    >
      {{ $t('notFound.goHome') }}
    </RouterLink>
  </div>
</template>
