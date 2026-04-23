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
const showEmojiPicker = ref(false)

const EMOJIS = [
  '😀','😂','😍','🥹','😎','🤔','😭','😅','🤣','😊',
  '😬','🥶','🫡','😤','💀','🙈','😴','🤯','🥳','😇',
  '👍','👎','👀','🙏','💪','🤝','👏','🫶','❤️','🔥',
  '🎉','💯','✅','⚡','🚀','💡','😱','🤮','💔','🫠',
]

function insertEmoji(emoji) {
  newMessage.value += emoji
  showEmojiPicker.value = false
}

const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

const lastActiveText = computed(() => {
 let lastmessage =  messages.value[messages.value.length-1];
 console.log(lastmessage)
 return lastmessage? formatDateTime(lastmessage.created_at) : null ;
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
  requestAnimationFrame(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
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
                class="mt-0.5 w-12 h-12 rounded-full shrink-0 overflow-hidden flex items-center justify-center"
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
                  class="material-symbols-outlined text-[22px]"
                  :class="isOwnMessage(message) ? 'text-white' : 'text-brand-primary'"
                >person</span>
              </div>

              <div class="max-w-[75%] flex flex-col gap-1.5" :class="isOwnMessage(message) ? 'items-end' : ''">
                <span v-if="!isOwnMessage(message)" class="text-brand-textSecondary text-sm font-semibold px-2">
                  {{ message.user?.name }}
                </span>
                <div
                  class="px-5 py-3 rounded-2xl text-base leading-relaxed"
                  :class="isOwnMessage(message)
                    ? 'bg-brand-primary text-white shadow-[0_2px_8px_rgba(22,100,122,0.15)]'
                    : 'bg-white text-brand-text shadow-[0_1px_4px_rgba(22,100,122,0.08)]'"
                >
                  {{ message.message }}
                </div>
                <div class="flex items-center gap-1.5 px-2" :class="isOwnMessage(message) ? 'flex-row-reverse' : ''">
                  <span class="text-brand-disabled text-xs">{{ formatDateTime(message.created_at) }}</span>
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
          <div class="px-4 py-3 bg-cerulean-50 rounded-b-2xl flex items-center gap-3" @click="showEmojiPicker = false">
            <!-- Emoji picker -->
            <div class="relative shrink-0" @click.stop>
              <button
                @click="showEmojiPicker = !showEmojiPicker"
                class="w-8 h-8 rounded-full bg-white text-brand-primary flex items-center justify-center transition-all hover:bg-cerulean-100 active:scale-95 shadow-[0_1px_3px_rgba(22,100,122,0.08)]"
              >
                <span class="material-symbols-outlined text-[16px]">sentiment_satisfied</span>
              </button>
              <div
                v-if="showEmojiPicker"
                class="absolute bottom-10 left-0 bg-white rounded-2xl shadow-[0_8px_32px_rgba(22,100,122,0.12)] p-3 grid grid-cols-8 gap-1 w-64 z-20"
              >
                <button
                  v-for="emoji in EMOJIS"
                  :key="emoji"
                  type="button"
                  @click="insertEmoji(emoji)"
                  class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-cerulean-50 text-lg transition-colors cursor-pointer"
                >{{ emoji }}</button>
              </div>
            </div>
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
