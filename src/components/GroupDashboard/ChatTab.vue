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
  <div class="w-full h-[calc(100vh-8rem)] flex flex-col bg-brand-background">

    <!-- Header -->
    <div class="px-6 pt-6 pb-4 flex items-center justify-between bg-brand-surface shadow-[0_2px_8px_rgba(22,100,122,0.06)]">
      <div class="flex flex-col gap-1">
        <h1 class="text-brand-text font-bold text-2xl">Group Chat</h1>
        <p class="text-brand-textSecondary text-xs font-medium">
          {{ props.group.users.length }} member{{ props.group.users.length !== 1 ? 's' : '' }}
        </p>
      </div>
      <button
          @click="loadChat"
          class="w-10 h-10 rounded-full bg-brand-surface text-brand-primary flex items-center justify-center transition-all hover:bg-cerulean-100 active:scale-95"
      >
        <span class="material-symbols-outlined text-[20px]">refresh</span>
      </button>
    </div>

    <!-- Main content -->
    <div class="flex-1 flex overflow-hidden gap-4 px-6 py-4">

      <!-- Messages area -->
      <div class="flex-1 flex flex-col gap-4 overflow-hidden">

        <!-- Loading -->
        <div v-if="loading" class="flex-1 flex items-center justify-center">
          <div class="flex flex-col items-center gap-4">
            <div class="w-10 h-10 rounded-full border-2 border-brand-primary border-t-transparent animate-spin"></div>
            <p class="text-brand-textSecondary text-sm font-medium">Loading conversation...</p>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-brand-surfaceContrast flex items-center justify-center">
            <span class="material-symbols-outlined text-3xl text-brand-disabled">error_outline</span>
          </div>
          <div class="flex flex-col items-center gap-1">
            <p class="text-brand-text font-semibold">{{ error }}</p>
            <p class="text-brand-textSecondary text-xs">Try refreshing the page</p>
          </div>
        </div>

        <!-- Messages container -->
        <template v-else>
          <div
              ref="messagesContainer"
              class="flex-1 overflow-y-auto flex flex-col gap-4 pr-2"
          >
            <!-- Empty state -->
            <div v-if="!messages.length" class="flex-1 flex flex-col items-center justify-center gap-3 py-12">
              <div class="w-12 h-12 rounded-2xl bg-brand-surfaceContrast flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl text-brand-disabled">chat_bubble_outline</span>
              </div>
              <div class="flex flex-col items-center gap-1">
                <p class="text-brand-textSecondary font-medium">No messages yet</p>
                <p class="text-brand-disabled text-xs">Start a conversation with your group members</p>
              </div>
            </div>

            <!-- Message groups -->
            <div
                v-for="message in messages"
                :key="message.id"
                class="flex gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-200"
                :class="isOwnMessage(message) ? 'flex-row-reverse' : ''"
            >
              <!-- Avatar -->
              <div class="mt-1 w-9 h-9 rounded-full shrink-0 overflow-hidden flex items-center justify-center flex-shrink-0"
                   :class="isOwnMessage(message) ? 'bg-brand-primary' : 'bg-cerulean-100'">
                <img
                    v-if="message.user?.avatar?.url"
                    :src="message.user.avatar.url"
                    :alt="message.user?.name"
                    class="w-full h-full object-cover"
                />
                <span v-else class="material-symbols-outlined text-[16px]"
                      :class="isOwnMessage(message) ? 'text-white' : 'text-brand-primary'">
                  person
                </span>
              </div>

              <!-- Message bubble -->
              <div class="max-w-xs flex flex-col gap-1.5" :class="isOwnMessage(message) ? 'items-end' : ''">
                <!-- Sender name (only show for others) -->
                <span v-if="!isOwnMessage(message)" class="text-brand-textSecondary text-xs font-semibold px-3">
                  {{ message.user?.name }}
                </span>

                <!-- Bubble -->
                <div
                    class="px-4 py-2.5 rounded-lg text-sm leading-relaxed transition-shadow"
                    :class="isOwnMessage(message)
                      ? 'bg-brand-primary text-white shadow-[0_2px_8px_rgba(22,100,122,0.12)]'
                      : 'bg-brand-surface text-brand-text shadow-[0_1px_3px_rgba(22,100,122,0.08)]'"
                >
                  {{ message.message }}
                </div>

                <!-- Timestamp and actions -->
                <div class="flex items-center gap-2 px-3" :class="isOwnMessage(message) ? 'flex-row-reverse' : ''">
                  <span class="text-brand-textSecondary text-[11px] font-medium">
                    {{ formatDateTime(message.created_at) }}
                  </span>
                  <button
                      v-if="isOwnMessage(message)"
                      @click="deleteMessage(message.id)"
                      class="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-brand-surfaceContrast"
                  >
                    <span class="material-symbols-outlined text-[14px] text-brand-disabled hover:text-red-500">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Input area -->
          <div class="flex items-end gap-3 bg-brand-surface rounded-xl px-4 py-3 shadow-[0_-2px_8px_rgba(22,100,122,0.06)]">
            <input
                v-model="newMessage"
                @keyup.enter="sendMessage"
                type="text"
                placeholder="Type a message..."
                class="flex-1 bg-transparent text-brand-text text-sm outline-none placeholder:text-brand-disabled resize-none"
                rows="1"
            />
            <button
                @click="sendMessage"
                :disabled="!newMessage.trim() || sending"
                class="w-9 h-9 rounded-full text-white flex items-center justify-center shrink-0 font-medium transition-all active:scale-95"
                :class="!newMessage.trim() || sending
                  ? 'bg-brand-disabled cursor-not-allowed'
                  : 'bg-brand-primary hover:bg-brand-primaryHover'"
            >
              <span class="material-symbols-outlined text-[18px]">{{ sending ? 'hourglass_empty' : 'send' }}</span>
            </button>
          </div>
        </template>
      </div>

      <!-- Members sidebar -->
      <div class="w-56 shrink-0 flex flex-col bg-brand-surface rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(22,100,122,0.08)]">
        <!-- Header -->
        <div class="px-4 pt-4 pb-3 bg-brand-surfaceContrast">
          <p class="text-brand-textSecondary text-xs font-bold uppercase tracking-widest">Members</p>
        </div>

        <!-- Members list -->
        <div class="flex-1 overflow-y-auto flex flex-col gap-1 p-2">
          <div
              v-for="member in props.group.users"
              :key="member.id"
              class="px-3 py-2.5 flex items-center gap-3 rounded-xl hover:bg-brand-surfaceContrast transition-colors"
          >
            <div class="w-9 h-9 rounded-full shrink-0 overflow-hidden flex items-center justify-center bg-cerulean-100 flex-shrink-0">
              <img
                  v-if="member.avatar?.url"
                  :src="member.avatar.url"
                  :alt="member.name"
                  class="w-full h-full object-cover"
              />
              <span v-else class="material-symbols-outlined text-[16px] text-brand-primary">person</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-brand-text text-sm font-medium truncate">{{ member.name }}</p>
              <p class="text-brand-disabled text-xs">Member</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
