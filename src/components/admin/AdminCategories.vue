<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/lib/axios'
import Swal from 'sweetalert2'

const categories = ref([])
const loading = ref(false)
const page = ref(1)
const lastPage = ref(1)
const total = ref(0)

const newName = ref('')
const creating = ref(false)

const editingId = ref(null)
const editingName = ref('')

const { t } = useI18n()

const flash = ref(null)
let flashTimer = null
function showFlash(message) {
  flash.value = message
  clearTimeout(flashTimer)
  flashTimer = setTimeout(() => (flash.value = null), 3000)
}

async function loadCategories() {
  loading.value = true
  try {
    const response = await api.get('/api/v1/categories', {
      params: { page: page.value },
    })
    categories.value = response.data.data.data
    lastPage.value = response.data.data.last_page
    total.value = response.data.data.total
  } catch (error) {
    console.error('Failed to load categories', error)
  } finally {
    loading.value = false
  }
}

function goToPage(n) {
  page.value = n
  loadCategories()
}

async function createCategory() {
  if (!newName.value.trim()) return
  creating.value = true
  try {
    await api.post('/api/v1/categories', { name: newName.value.trim() })
    newName.value = ''
    await loadCategories()
    showFlash(t('admin.categories.flash.created'))
  } catch (error) {
    console.error('Failed to create category', error)
  } finally {
    creating.value = false
  }
}

function startEdit(category) {
  editingId.value = category.id
  editingName.value = category.name
}

function cancelEdit() {
  editingId.value = null
  editingName.value = ''
}

async function saveEdit() {
  if (!editingName.value.trim()) return
  try {
    await api.patch(`/api/v1/categories/${editingId.value}`, {
      name: editingName.value.trim(),
    })
    cancelEdit()
    await loadCategories()
    showFlash(t('admin.categories.flash.updated'))
  } catch (error) {
    console.error('Failed to update category', error)
  }
}

async function deleteCategory(id) {
  const { isConfirmed } = await Swal.fire({
    title: t('admin.categories.dialogs.delete.title'),
    text: t('admin.categories.dialogs.delete.text'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: t('admin.categories.dialogs.delete.confirm'),
    cancelButtonText: t('admin.categories.dialogs.delete.cancel'),
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#16647a',
  })
  if (!isConfirmed) return
  try {
    await api.delete(`/api/v1/categories/${id}`)
    await loadCategories()
    showFlash(t('admin.categories.flash.deleted'))
  } catch (error) {
    console.error('Failed to delete category', error)
  }
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

onMounted(loadCategories)
</script>

<template>
  <div class="flex flex-col gap-7">
    <!-- Page head -->
    <div class="flex flex-col gap-2 pt-5">
      <span
        class="text-brand-primary font-semibold text-[12px] uppercase tracking-[0.14em]"
      >
        {{ t('admin.categories.breadcrumb') }}
      </span>
      <h1
        class="text-brand-text font-extrabold text-[38px] leading-[1.05] tracking-[-0.03em] m-0"
      >
        {{ t('admin.categories.title') }}
      </h1>
      <p class="text-brand-textSecondary text-sm pt-1">
        {{ t('admin.categories.subtitle') }}
      </p>
    </div>

    <!-- Flash -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition-all duration-200 ease-in"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="flash"
        class="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white text-brand-primary text-[13px] font-semibold"
        style="box-shadow: 0 1px 2px rgba(22, 100, 122, 0.06), 0 2px 8px rgba(22, 100, 122, 0.04)"
      >
        <span class="material-symbols-outlined text-[18px]">check_circle</span>
        {{ flash }}
      </div>
    </transition>

    <!-- Add Category -->
    <div
      class="bg-white rounded-3xl px-6 py-5 flex flex-col gap-4"
      style="box-shadow: 0 1px 2px rgba(22, 100, 122, 0.06), 0 2px 8px rgba(22, 100, 122, 0.04)"
    >
      <div class="flex flex-col gap-1">
        <p
          class="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-disabled"
        >
          {{ t('admin.categories.add.label') }}
        </p>
        <h3
          class="text-[18px] font-bold text-brand-text tracking-[-0.02em] leading-tight"
        >
          {{ t('admin.categories.add.title') }}
        </h3>
      </div>
      <form @submit.prevent="createCategory" class="flex flex-col md:flex-row gap-3">
        <input
          v-model="newName"
          type="text"
          :placeholder="t('admin.categories.add.placeholder')"
          class="flex-1 px-5 py-2.5 bg-brand-background rounded-full text-[13.5px] text-brand-text placeholder:text-brand-disabled outline-none focus:ring-2 focus:ring-brand-primary"
        />
        <button
          type="submit"
          :disabled="creating || !newName.trim()"
          class="bg-brand-primary hover:bg-brand-primaryHover text-white px-6 py-2.5 rounded-full font-semibold text-[13px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          {{ t('admin.categories.add.button') }}
        </button>
      </form>
    </div>

    <!-- Categories Table -->
    <div
      class="bg-white rounded-3xl overflow-hidden"
      style="box-shadow: 0 1px 2px rgba(22, 100, 122, 0.06), 0 2px 8px rgba(22, 100, 122, 0.04)"
    >
      <div class="flex items-center justify-between px-6 pt-5 pb-4 gap-4">
        <div class="flex flex-col gap-1">
          <p
            class="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-disabled"
          >
            {{ t('admin.categories.table.label') }}
          </p>
          <h3
            class="text-[18px] font-bold text-brand-text tracking-[-0.02em] leading-tight"
          >
            {{ t('admin.categories.table.title') }}
          </h3>
        </div>
        <span
          class="px-2.5 py-0.5 rounded-full font-semibold text-[11.5px] bg-brand-background text-brand-textSecondary"
        >
          {{ t('admin.categories.table.total', { total }) }}
        </span>
      </div>

      <div v-if="loading" class="text-brand-textSecondary py-10 text-center text-sm">
        {{ t('admin.categories.table.loading') }}
      </div>
      <div
        v-else-if="categories.length === 0"
        class="text-brand-textSecondary py-10 text-center text-sm"
      >
        {{ t('admin.categories.table.empty') }}
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-[13px]">
          <thead>
            <tr class="bg-brand-background text-left">
              <th
                class="px-6 py-2.5 font-semibold text-[10.5px] uppercase tracking-[0.14em] text-brand-disabled"
              >
                {{ t('admin.categories.table.colId') }}
              </th>
              <th
                class="px-6 py-2.5 font-semibold text-[10.5px] uppercase tracking-[0.14em] text-brand-disabled"
              >
                {{ t('admin.categories.table.colName') }}
              </th>
              <th
                class="px-6 py-2.5 font-semibold text-[10.5px] uppercase tracking-[0.14em] text-brand-disabled"
              >
                {{ t('admin.categories.table.colCreated') }}
              </th>
              <th
                class="px-6 py-2.5 font-semibold text-[10.5px] uppercase tracking-[0.14em] text-brand-disabled"
              >
                {{ t('admin.categories.table.colUpdated') }}
              </th>
              <th
                class="px-6 py-2.5 font-semibold text-[10.5px] uppercase tracking-[0.14em] text-brand-disabled text-right"
              >
                {{ t('admin.categories.table.colActions') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="category in categories"
              :key="category.id"
              class="shadow-[inset_0_1px_0] shadow-brand-background hover:bg-brand-background/40 transition-colors"
            >
              <td class="px-6 py-3.5 text-brand-textSecondary font-mono text-[12.5px]">
                #{{ category.id }}
              </td>
              <td class="px-6 py-3.5 text-brand-text font-semibold">
                <input
                  v-if="editingId === category.id"
                  v-model="editingName"
                  type="text"
                  class="w-full px-3 py-1.5 bg-brand-background rounded-full text-brand-text outline-none focus:ring-2 focus:ring-brand-primary text-[13px]"
                />
                <span v-else>{{ category.name }}</span>
              </td>
              <td class="px-6 py-3.5 text-brand-textSecondary">
                {{ formatDate(category.created_at) }}
              </td>
              <td class="px-6 py-3.5 text-brand-textSecondary">
                {{ formatDate(category.updated_at) }}
              </td>
              <td class="px-6 py-3.5">
                <div class="flex items-center justify-end gap-1.5">
                  <template v-if="editingId === category.id">
                    <button
                      type="button"
                      @click="saveEdit"
                      class="bg-brand-primary hover:bg-brand-primaryHover text-white px-3 py-1.5 rounded-full font-semibold text-[11.5px] transition-colors"
                    >
                      {{ t('admin.categories.table.save') }}
                    </button>
                    <button
                      type="button"
                      @click="cancelEdit"
                      class="bg-brand-background hover:bg-brand-surface text-brand-textSecondary px-3 py-1.5 rounded-full font-semibold text-[11.5px] transition-colors"
                    >
                      {{ t('admin.categories.table.cancel') }}
                    </button>
                  </template>
                  <template v-else>
                    <button
                      type="button"
                      @click="startEdit(category)"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-[11.5px] bg-brand-background hover:bg-brand-surface text-brand-textSecondary hover:text-brand-primary transition-colors"
                    >
                      <span class="material-symbols-outlined text-[15px]">edit</span>
                      {{ t('admin.categories.table.edit') }}
                    </button>
                    <button
                      type="button"
                      @click="deleteCategory(category.id)"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-[11.5px] bg-brand-background hover:bg-red-50 text-brand-textSecondary hover:text-red-600 transition-colors"
                    >
                      <span class="material-symbols-outlined text-[15px]">delete</span>
                      {{ t('admin.categories.table.delete') }}
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="lastPage > 1"
        class="flex items-center justify-between px-6 py-4 bg-brand-background gap-3 flex-wrap"
      >
        <span class="text-[12px] text-brand-textSecondary">
          {{ t('admin.categories.table.pageOf', { page, last: lastPage }) }}
        </span>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            @click="goToPage(page - 1)"
            :disabled="page === 1"
            class="w-8 h-8 rounded-lg flex items-center justify-center bg-white text-brand-textSecondary hover:text-brand-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style="box-shadow: 0 1px 2px rgba(22, 100, 122, 0.06)"
          >
            <span class="material-symbols-outlined text-[16px]">arrow_back</span>
          </button>

          <button
            v-for="pageNum in lastPage"
            :key="pageNum"
            type="button"
            @click="goToPage(pageNum)"
            class="w-8 h-8 rounded-lg font-semibold text-[12px] transition-colors"
            :class="
              page === pageNum
                ? 'bg-brand-primary text-white'
                : 'bg-white text-brand-textSecondary hover:text-brand-primary'
            "
            :style="page === pageNum ? '' : 'box-shadow: 0 1px 2px rgba(22, 100, 122, 0.06)'"
          >
            {{ pageNum }}
          </button>

          <button
            type="button"
            @click="goToPage(page + 1)"
            :disabled="page === lastPage"
            class="w-8 h-8 rounded-lg flex items-center justify-center bg-white text-brand-textSecondary hover:text-brand-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style="box-shadow: 0 1px 2px rgba(22, 100, 122, 0.06)"
          >
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>