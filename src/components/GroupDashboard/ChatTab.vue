<script setup>
import {ref, onMounted, onUnmounted, nextTick} from 'vue'
import echo from "@/lib/echo.js";
import api from '@/lib/axios'

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

const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

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
    await nextTick() //stop the fing
    scrollToBottom()
  } catch {
    // silent fail
  } finally {
    sending.value = false
  }
}

async function deleteMessage(messageId) {
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
  loadChat();
  echo.private(`conversation.${props.group.conversation.id}`)
      .listen('MessageSent', async (e) => {
        messages.value.push(e.message);
        await nextTick();
        scrollToBottom();
      })
    }
)

onUnmounted(()=>{
  echo.leave(`conversation.${props.group.conversation.id}`)
})
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-8rem)]">
    <!-- Header -->
    <div class="flex items-center justify-between pb-4">
      <h2 class="text-brand-text font-bold text-xl">Group Chat</h2>
      <button
          @click="loadChat"
          class="w-9 h-9 rounded-full bg-cerulean-50 flex items-center justify-center hover:bg-cerulean-100 transition-colors"
      >
        <span class="material-symbols-outlined text-brand-primary text-[18px]">refresh</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin"/>
        <p class="text-brand-textSecondary text-sm">Loading chat...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center gap-4">
      <span class="material-symbols-outlined text-[56px] text-brand-disabled">chat</span>
      <p class="text-brand-textSecondary font-semibold text-lg">{{ error }}</p>
    </div>

    <!-- Chat -->
    <template v-else>
      <!-- Messages -->
      <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto bg-brand-surface rounded-2xl p-4 flex flex-col gap-3"
      >
        <div v-if="!messages.length" class="flex-1 flex flex-col items-center justify-center gap-2 py-12">
          <span class="material-symbols-outlined text-[40px] text-brand-disabled">chat_bubble</span>
          <p class="text-brand-textSecondary text-sm">No messages yet. Start the conversation!</p>
        </div>

        <div
            v-for="message in messages"
            :key="message.id"
            class="flex gap-3 group"
            :class="isOwnMessage(message) ? 'flex-row-reverse' : ''"
        >
          <!-- Avatar -->
          <div class="w-8 h-8 rounded-full bg-cerulean-100 shrink-0 overflow-hidden flex items-center justify-center">
            <img
                v-if="message.user?.avatar?.url"
                :src="message.user.avatar.url"
                :alt="message.user?.name"
                class="w-full h-full object-cover"
            />
            <span v-else class="material-symbols-outlined text-brand-primary text-[14px]">person</span>
          </div>

          <!-- Bubble -->
          <div class="max-w-[70%] flex flex-col gap-1" :class="isOwnMessage(message) ? 'items-end' : ''">
            <span v-if="!isOwnMessage(message)" class="text-brand-textSecondary text-xs font-semibold">
              {{ message.user?.name }}
            </span>
            <div
                class="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                :class="isOwnMessage(message) ? 'bg-brand-primary text-white rounded-br-md' : 'bg-white text-brand-text rounded-bl-md shadow-[0_1px_4px_rgba(22,100,122,0.06)]'"
            >
              {{ message.message }}
            </div>
            <div class="flex items-center gap-2">
              <span class="text-brand-textSecondary text-[10px]">
                {{ formatDateTime(message.created_at) }}
              </span>
              <button
                  v-if="isOwnMessage(message)"
                  @click="deleteMessage(message.id)"
                  class="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span class="material-symbols-outlined text-red-400 hover:text-red-500 text-[14px]">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="flex items-center gap-3 pt-4">
        <input
            v-model="newMessage"
            @keyup.enter="sendMessage"
            type="text"
            placeholder="Type a message..."
            class="flex-1 px-5 py-3 rounded-full bg-white text-brand-text text-sm shadow-[0_2px_12px_rgba(22,100,122,0.06)] outline-none focus:ring-2 focus:ring-brand-primary/20 placeholder:text-brand-disabled"
        />
        <button
            @click="sendMessage"
            :disabled="!newMessage.trim() || sending"
            class="w-11 h-11 rounded-full bg-brand-primary text-white flex items-center justify-center shrink-0 transition-colors"
            :class="!newMessage.trim() || sending ? 'opacity-50' : 'hover:bg-brand-primaryHover'"
        >
          <span class="material-symbols-outlined text-[20px]">send</span>
        </button>
      </div>
    </template>
  </div>
</template>
