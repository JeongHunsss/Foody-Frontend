<script setup lang="ts">
import { ref, nextTick, watch, onUnmounted } from 'vue'
import { Client } from '@stomp/stompjs'
import { chatApi, type ChatRoom, type ChatMessage } from '@/api/chat.api'
import { X, Send, FileText } from 'lucide-vue-next'
import ReportAnalysisPanel from './ReportAnalysisPanel.vue'

const props = defineProps<{
  isOpen: boolean
  reportId?: number
  userName: string // Current user name
  userId: string // Current user ID
  roomId?: string // Optional room ID (for Admin View)
  partnerName?: string // Name of the chat partner
}>()

const emit = defineEmits(['close'])

const showReportPanel = ref(false)

const messages = ref<ChatMessage[]>([])
const newMessage = ref('')
const room = ref<ChatRoom | null>(null)
const stompClient = ref<Client | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
// Convert http->ws and append /ws-stomp/websocket for raw WS connection to SockJS endpoint
const WS_URL = API_BASE_URL.replace(/^http/, 'ws') + '/ws-stomp/websocket'

// Connect to WebSocket
const connectWebSocket = () => {
  if (!room.value) return

  const client = new Client({
    brokerURL: WS_URL,
    onConnect: () => {
      console.log('Connected to Chat')
      if (room.value) {
          client.subscribe(`/sub/chat/room/${room.value.id}`, (message) => {
            const received = JSON.parse(message.body)
            messages.value.push(received)
            scrollToBottom()
          })
      }
    },
    onStompError: (frame) => {
      console.error('Broker reported error: ' + frame.headers['message'])
    }
  })
  
  client.activate()
  stompClient.value = client
}

// Initialize
const initChat = async () => {
  try {
    if (props.roomId) {
      // Use provided roomId
      room.value = { id: props.roomId } as ChatRoom
    } else if (props.reportId) {
       // Create or get by reportId
       room.value = await chatApi.createOrGetRoom(props.reportId)
    } else {
        console.error("No roomId or reportId provided")
        return
    }

    const history = await chatApi.getMessages(room.value.id)
    messages.value = history
    connectWebSocket()
    scrollToBottom()
  } catch (e) {
    console.error(e)
  }
}

const sendMessage = () => {
  if (!newMessage.value.trim() || !stompClient.value || !room.value) return
  
  const msg = {
    roomId: room.value.id,
    senderId: props.userId,
    message: newMessage.value
  }
  
  stompClient.value.publish({
    destination: '/pub/message',
    body: JSON.stringify(msg)
  })
  
  newMessage.value = ''
  // Optimization: push locally immediately or wait for server reflection?
  // Since we subscribe, we'll wait for server.
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    initChat()
  } else {
    stompClient.value?.deactivate()
    messages.value = []
    room.value = null
  }
})

onUnmounted(() => {
  stompClient.value?.deactivate()
})
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div 
        class="bg-white rounded-2xl shadow-2xl flex overflow-hidden transition-all duration-300"
        :class="showReportPanel ? 'w-[1200px] h-[800px]' : 'w-full max-w-md h-[600px]'"
    >
      <!-- Report Panel (Left Side) -->
      <div v-if="showReportPanel" class="w-[60%] border-r border-gray-200 h-full">
         <ReportAnalysisPanel 
            :report-id="reportId!" 
            @close="showReportPanel = false"
            @submitted="showReportPanel = false" 
         />
      </div>

      <!-- Chat Panel (Right Side) -->
      <div class="flex-1 flex flex-col h-full bg-white relative">
          <!-- Header -->
          <div class="p-4 bg-emerald-500 text-white flex justify-between items-center shrink-0">
            <h3 class="font-bold">1:1 채팅 {{ partnerName ? `with ${partnerName}` : '' }}</h3>
            <div class="flex items-center gap-2">
              <button 
                v-if="reportId"
                @click="showReportPanel = !showReportPanel" 
                class="hover:bg-white/20 p-1 rounded transition-colors"
                :title="showReportPanel ? '레포트 닫기' : '레포트 보기'"
                :class="{ 'bg-white/20': showReportPanel }"
              >
                <FileText :size="20" />
              </button>
              <button @click="$emit('close')" class="hover:bg-white/20 p-1 rounded transition-colors">
                <X :size="20" />
              </button>
            </div>
          </div>
          
          <!-- Messages -->
          <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            <div v-for="msg in messages" :key="msg.id" 
                 :class="['flex', msg.senderId === userId ? 'justify-end' : 'justify-start']">
              <div :class="['max-w-[80%] rounded-2xl px-4 py-2 text-sm', 
                           msg.senderId === userId ? 'bg-emerald-500 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm']">
                <p>{{ msg.message }}</p>
                <p :class="['text-[10px] mt-1 text-right', msg.senderId === userId ? 'text-emerald-100' : 'text-gray-400']">
                  {{ new Date(msg.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
                </p>
              </div>
            </div>
          </div>
          
          <!-- Input -->
          <div class="p-4 bg-white border-t border-gray-200 flex gap-2 shrink-0">
            <input 
              v-model="newMessage" 
              @keyup.enter="sendMessage"
              type="text" 
              placeholder="메시지를 입력하세요..." 
              class="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
            <button 
              @click="sendMessage"
              class="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors flex-shrink-0"
              :disabled="!newMessage.trim()"
            >
              <Send :size="20" />
            </button>
          </div>
      </div>
    </div>
  </div>
</template>
