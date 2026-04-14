<script setup>
import {ref, computed, onMounted, onUnmounted, nextTick} from 'vue'
import echo from "@/lib/echo.js";
import api from '@/lib/axios'
import Swal from 'sweetalert2'

const props = defineProps({
  groupId: [Number, String],
  group: Object,
})

const conversation = ref(null)
const messages = ref([])
const loading = ref(true)
const sending = ref(false)
const newMessage = ref('')
const messagesContainer = ref(null)
const error = ref(null)
const contextMenuOpen = ref(false)

const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

const lastActiveText = computed(() => {
  const dateStr = props.group?.conversation?.updated_at
  if (!dateStr) return null
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'Active just now'
  if (diff < 3600) return `Active ${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `Active ${Math.floor(diff / 3600)}h ago`
  if (diff < 172800) return 'Active yesterday'
  return `Active ${new Date(dateStr).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}`
})

async function loadChat() {
  loading.value = true
  error.value = null
  try {
    const res = await api.get(`/api/v1/conversations/${props.group.conversation.id}`)
    const conv = res.data.data
    conversation.value = conv
    messages.value = (conv.messages ?? []).reverse()
    await nextTick()
    scrollToBottom()
  } catch {
    error.value = 'Failed to load chat'
  } finally {
    loading.value = false
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || !conversation.value || sending.value) return
  sending.value = true
  try {
    const res = await api.post(`/api/v1/conversations/${conversation.value.id}`, {
      message: newMessage.value.trim(),
    })
    messages.value.push(res.data.data)
    newMessage.value = ''
    await nextTick()
    scrollToBottom()
  } catch {
    // silent fail
  } finally {
    sending.value = false
  }
}

async function deleteMessage(messageId) {
  const {isConfirmed} = await Swal.fire({
    title: 'Delete message?',
    text: 'This action cannot be undone.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#16647a',
    cancelButtonColor: '#e5e7eb',
  })
  if (!isConfirmed) return
  try {
    await api.delete(`/api/v1/messages/${messageId}`)
    messages.value = messages.value.filter((m) => m.id !== messageId)
  } catch {
    // silent fail
  }
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr)
  return (
    d.toLocaleDateString('en-US', {month: 'short', day: 'numeric'}) +
    ' · ' +
    d.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'})
  )
}

function isOwnMessage(message) {
  return message.user_id === currentUser.id
}

onMounted(() => {
  loadChat()
  echo.private(`conversation.${props.group.conversation.id}`)
    .listen('MessageSent', async (e) => {
      messages.value.push(e)
      await nextTick()
      scrollToBottom()
    })
})

onUnmounted(() => {
  echo.leave(`conversation.${props.group.conversation.id}`)
})
</script>

<template>
  <div class="flex flex-col h-full bg-brand-background overflow-hidden">

    <!-- ─── Chat area ─── -->
    <div class="flex flex-col flex-1 min-h-0">

      <!-- Header -->
      <header class="shrink-0 px-6 py-3.5 bg-brand-surface/80 backdrop-blur-[12px] shadow-[0_2px_8px_rgba(22,100,122,0.07)] flex items-center justify-between">
        <div class="flex flex-col gap-0.5">
          <h1 class="text-brand-text font-bold text-[15px] leading-tight">{{ props.group.name }}</h1>
          <div class="flex items-center gap-1.5">
            <span class="text-brand-textSecondary text-xs">
              {{ props.group.users.length }} member{{ props.group.users.length !== 1 ? 's' : '' }}
            </span>
            <template v-if="lastActiveText">
              <span class="text-brand-disabled text-xs">·</span>
              <span class="text-brand-disabled text-xs">{{ lastActiveText }}</span>
            </template>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1">
          <button class="w-9 h-9 rounded-full flex items-center justify-center text-brand-textSecondary hover:bg-cerulean-100 hover:text-brand-primary transition-all active:scale-95">
            <span class="material-symbols-outlined text-[20px]">search</span>
          </button>
          <button
            @click="loadChat"
            class="w-9 h-9 rounded-full flex items-center justify-center text-brand-textSecondary hover:bg-cerulean-100 hover:text-brand-primary transition-all active:scale-95"
          >
            <span class="material-symbols-outlined text-[18px]">refresh</span>
          </button>

          <!-- Context menu -->
          <div class="relative">
            <button
              @click="contextMenuOpen = !contextMenuOpen"
              class="w-9 h-9 rounded-full flex items-center justify-center text-brand-textSecondary hover:bg-cerulean-100 hover:text-brand-primary transition-all active:scale-95"
            >
              <span class="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
            <div
              v-if="contextMenuOpen"
              class="absolute right-0 top-11 w-52 bg-brand-surface rounded-2xl shadow-[0_8px_24px_rgba(22,100,122,0.13)] py-2 z-[100] flex flex-col"
            >
              <button class="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-text hover:bg-brand-surfaceContrast transition-colors text-left w-full">
                <span class="material-symbols-outlined text-[17px] text-brand-textSecondary">search</span>
                Search messages
              </button>
              <button class="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-text hover:bg-brand-surfaceContrast transition-colors text-left w-full">
                <span class="material-symbols-outlined text-[17px] text-brand-textSecondary">notifications</span>
                Mute notifications
              </button>
            </div>
            <div v-if="contextMenuOpen" @click="contextMenuOpen = false" class="fixed inset-0 z-[99]"/>
          </div>
        </div>
      </header>

      <!-- Chat body -->
      <div class="flex-1 flex flex-col overflow-hidden">

        <!-- Loading -->
        <div v-if="loading" class="flex-1 flex items-center justify-center">
          <div class="flex flex-col items-center gap-3">
            <div class="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin"></div>
            <p class="text-brand-textSecondary text-sm">Loading conversation...</p>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-brand-surfaceContrast flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl text-brand-disabled">error_outline</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <p class="text-brand-text font-semibold text-sm">{{ error }}</p>
            <p class="text-brand-textSecondary text-xs">Try refreshing the page</p>
          </div>
        </div>

        <!-- Unified chat card: messages + composer -->
        <div v-else class="flex-1 flex flex-col overflow-hidden bg-brand-surface mx-4 my-4 rounded-2xl shadow-[0_2px_12px_rgba(22,100,122,0.07)]">

          <!-- Messages scrollable area -->
          <div ref="messagesContainer" class="flex-1 overflow-y-auto flex flex-col gap-3 p-5">

            <!-- Empty state -->
            <div v-if="!messages.length" class="flex-1 flex flex-col items-center justify-center gap-3 py-6">
              <div class="w-12 h-12 rounded-2xl bg-brand-surfaceContrast flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl text-brand-disabled">forum</span>
              </div>
              <div class="flex flex-col items-center gap-1.5">
                <p class="text-brand-text font-semibold text-sm">No messages yet</p>
                <p class="text-brand-textSecondary text-xs text-center">Start the conversation with your group</p>
                <p class="text-brand-disabled text-xs">Send the first message ↓</p>
              </div>
            </div>

            <!-- Messages -->
            <div
              v-for="message in messages"
              :key="message.id"
              class="flex gap-2.5 group"
              :class="isOwnMessage(message) ? 'flex-row-reverse' : ''"
            >
              <div
                class="mt-0.5 w-8 h-8 rounded-full shrink-0 overflow-hidden flex items-center justify-center"
                :class="isOwnMessage(message) ? 'bg-brand-primary' : 'bg-cerulean-100'"
              >
                <img
                  v-if="message.user?.avatar?.url"
                  :src="message.user.avatar.url"
                  :alt="message.user?.name"
                  class="w-full h-full object-cover"
                />
                <span
                  v-else
                  class="material-symbols-outlined text-[14px]"
                  :class="isOwnMessage(message) ? 'text-white' : 'text-brand-primary'"
                >person</span>
              </div>

              <div class="max-w-[62%] flex flex-col gap-1" :class="isOwnMessage(message) ? 'items-end' : ''">
                <span v-if="!isOwnMessage(message)" class="text-brand-textSecondary text-[11px] font-semibold px-2">
                  {{ message.user?.name }}
                </span>
                <div
                  class="px-3.5 py-2 rounded-xl text-sm leading-relaxed"
                  :class="isOwnMessage(message)
                    ? 'bg-brand-primary text-white shadow-[0_2px_8px_rgba(22,100,122,0.15)]'
                    : 'bg-white text-brand-text shadow-[0_1px_4px_rgba(22,100,122,0.08)]'"
                >
                  {{ message.message }}
                </div>
                <div class="flex items-center gap-1.5 px-2" :class="isOwnMessage(message) ? 'flex-row-reverse' : ''">
                  <span class="text-brand-disabled text-[10px]">{{ formatDateTime(message.created_at) }}</span>
                  <button
                    v-if="isOwnMessage(message)"
                    @click="deleteMessage(message.id)"
                    class="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-brand-surfaceContrast"
                  >
                    <span class="material-symbols-outlined text-[13px] text-brand-disabled hover:text-red-500">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Composer -->
          <div class="px-4 py-3 bg-cerulean-50 rounded-b-2xl flex items-center gap-3">
            <button class="w-8 h-8 rounded-full bg-white text-brand-primary flex items-center justify-center shrink-0 transition-all hover:bg-cerulean-100 active:scale-95 shadow-[0_1px_3px_rgba(22,100,122,0.08)]">
              <span class="material-symbols-outlined text-[16px]">sentiment_satisfied</span>
            </button>
            <input
              v-model="newMessage"
              @keyup.enter="sendMessage"
              type="text"
              placeholder="Write a message..."
              class="flex-1 bg-white rounded-full px-4 py-2 text-brand-text text-sm outline-none placeholder:text-brand-disabled shadow-[0_1px_3px_rgba(22,100,122,0.06)] focus:ring-2 focus:ring-brand-primary/10"
            />
            <button
              @click="sendMessage"
              :disabled="!newMessage.trim() || sending"
              class="w-8 h-8 rounded-full text-white flex items-center justify-center shrink-0 transition-all active:scale-95"
              :class="!newMessage.trim() || sending ? 'bg-brand-disabled cursor-not-allowed' : 'bg-brand-primary hover:bg-brand-primaryHover'"
            >
              <span class="material-symbols-outlined text-[16px]">{{ sending ? 'hourglass_empty' : 'send' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
