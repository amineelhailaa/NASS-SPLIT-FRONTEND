<script setup>
import { ref } from 'vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminOverview from '@/components/admin/AdminOverview.vue'
import AdminCategories from '@/components/admin/AdminCategories.vue'
import AdminGroups from '@/components/admin/AdminGroups.vue'
import AdminUsers from '@/components/admin/AdminUsers.vue'
import AdminContacts from '@/components/admin/AdminContacts.vue'

const activeTab = ref('overview')

function changeTab(tab) {
  activeTab.value = tab
}
</script>

<template>
  <div
    class="flex min-h-screen bg-brand-background"
    style="font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.005em"
  >
    <AdminSidebar :active-tab="activeTab" @change-tab="changeTab" />

    <main class="flex-1 px-9 py-8">
      <AdminOverview v-if="activeTab === 'overview'" />
      <AdminCategories v-if="activeTab === 'categories'" />
      <AdminGroups v-if="activeTab === 'groups'" />
      <AdminUsers v-if="activeTab === 'users'" />
      <AdminContacts v-if="activeTab === 'contacts'" />
    </main>
  </div>
</template>
