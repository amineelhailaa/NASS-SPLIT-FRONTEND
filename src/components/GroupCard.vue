<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  id: Number,
  name: String,
  category: String,
  memberCount: Number,
  url: String,
  role: String,
})

const router = useRouter()



const categoryStyle = computed(() => {
  const map = {
    Travel: { bg: 'bg-cerulean-500', icon: 'flight' },
    Home: { bg: 'bg-cerulean-700', icon: 'home' },
    Family: { bg: 'bg-cerulean-600', icon: 'family_restroom' },
    Work: { bg: 'bg-cerulean-800', icon: 'work' },
    Hobbies: { bg: 'bg-cerulean-400', icon: 'sports_esports' },
    Education: { bg: 'bg-cerulean-500', icon: 'school' },
  }
  return map[props.category] ?? map['Travel']
})
</script>

<template>
  <div
    class="bg-white rounded-2xl p-5 flex flex-col group hover:shadow-[0_8px_32px_rgba(65,119,139,0.14)] transition-all duration-300 shadow-[0_2px_12px_rgba(65,119,139,0.07)]"
  >
    <!-- Cover -->
    <div class="aspect-video w-full rounded-xl overflow-hidden relative" :class="categoryStyle.bg">
      <!-- Avatar image (covers the whole card header) -->
      <img
        v-if="url"
        :src="url"
        :alt="name"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <!-- Fallback icon -->
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="material-symbols-outlined text-white/30 text-[72px]">{{ categoryStyle.icon }}</span>
      </div>
      <div class="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
      <!-- Category badge -->
      <span
        class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-textSecondary z-10"
      >
        {{ category }}
      </span>
      <!-- Owner crown badge -->
      <span
        v-if="role === 'owner'"
        class="absolute top-3 left-3 bg-amber-400/90 backdrop-blur-sm w-7 h-7 rounded-full flex items-center justify-center z-10"
        title="You own this group"
      >
        <span class="material-symbols-outlined text-white text-[16px]">crown</span>
      </span>
    </div>

    <!-- Info -->
    <div class="flex-grow pt-4 pb-4">
      <h3 class="text-brand-text text-xl font-bold">{{ name }}</h3>
      <p class="text-brand-primary font-medium text-sm flex items-center gap-1 pt-1">
        <span class="material-symbols-outlined text-[17px]">group</span>
        {{ memberCount }} Members
      </p>
    </div>

    <!-- CTA -->
    <button
      class="cursor-pointer w-full bg-brand-primary text-white py-3 rounded-full font-bold hover:bg-brand-primaryHover transition-colors flex items-center justify-center gap-2 text-sm"
      @click="router.push({ name: 'group-detail', params: { id }, state: { role } })"
    >
      Enter Group
      <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
    </button>
  </div>
</template>