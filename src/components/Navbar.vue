<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, LogOut, LogIn, Shield, Menu, X, Bell } from 'lucide-vue-next'
import logoImage from '@/assets/foody_logo.png'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import { Client } from '@stomp/stompjs'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const isAdmin = computed(() => authStore.isAdmin)
const userName = computed(() => authStore.user?.name || '마이페이지')
const userId = computed(() => authStore.user?.id) // 사용자 ID 가져오기
const isMenuOpen = ref(false)

// 알림 드롭다운 UI 상태
const showNotificationList = ref(false)

// 토스트 상태 (UI 전용)
const notificationMessage = ref('')
const showNotification = ref(false)

let stompClient: Client | null = null

const handleLogout = async () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    disconnectWebSocket() // 로그아웃 시 웹소켓 연결 해제
    await authStore.logout()
    // 로그아웃 시 알림 초기화
    notificationStore.clearAll()
    try {
      await router.push('/')
    } catch (e) {
      // Ignore navigation errors
    }
    isMenuOpen.value = false
  }
}

const isActive = (path: string) => {
  return route.path === path
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const navigateTo = (path: string) => {
  router.push(path)
  closeMenu()
}

// 알림 목록 토글
const toggleNotifications = () => {
  showNotificationList.value = !showNotificationList.value
}

// WebSocket 연결 설정
const connectWebSocket = () => {
  if (!isLoggedIn.value || !userId.value || stompClient?.active) return;

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  const WS_URL = API_BASE_URL.replace(/^http/, 'ws') + '/ws-stomp/websocket';

  const client = new Client({
    brokerURL: WS_URL,
    onConnect: () => {
      console.log('Connected to Notification Service');
      // 내 ID로 오는 알림 구독
      client.subscribe(`/sub/notification/${userId.value}`, (message) => {
        console.log("Navbar: Raw message body:", message.body);
        try {
          const received = JSON.parse(message.body);
          console.log("Navbar: Parsed notification:", received);
          
          // Store에 알림 추가
          notificationStore.addNotification({
            id: Date.now(),
            message: received.message,
            senderId: received.senderId,
            time: new Date(),
            roomId: received.roomId,
            reportDate: received.reportDate
          });
          
          // 토스트 표시
          showToast(received.message);
        } catch (e) {
          console.error("Failed to parse notification", e);
        }
      });
    },
    onStompError: (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
    }
  });

  client.activate();
  stompClient = client;
};

const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
}

const showToast = (message: string) => {
    notificationMessage.value = message;
    showNotification.value = true;
    setTimeout(() => {
        showNotification.value = false;
    }, 3000); // 3초 후 사라짐
}

// 로그인 상태 변경 감지하여 웹소켓 연결/해제
watch(isLoggedIn, (newVal) => {
    if (newVal) {
        connectWebSocket();
    } else {
        disconnectWebSocket();
    }
});

onMounted(() => {
    if (isLoggedIn.value) {
        connectWebSocket();
    }
    // 클릭 시 알림 목록 닫기
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.notification-container')) {
        showNotificationList.value = false;
      }
    });
});

onUnmounted(() => {
    disconnectWebSocket();
});
</script>

<template>
  <nav class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- 로고 -->
        <button
          @click="navigateTo('/')"
          class="hover:opacity-80 transition-opacity"
        >
          <img :src="logoImage" alt="Foody Logo" class="h-12 object-contain" />
        </button>

        <!-- 데스크톱 메뉴 링크 -->
        <div class="hidden md:flex items-center gap-2">
          <button
            @click="navigateTo('/')"
            :class="[
              'px-4 py-2 rounded-xl transition-all',
              isActive('/') 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'text-gray-700 hover:bg-gray-100'
            ]"
            style="font-family: 'Pretendard', sans-serif;"
          >
            홈
          </button>
          <button
            @click="navigateTo('/meal-management')"
            :class="[
              'px-4 py-2 rounded-xl transition-all',
              isActive('/meal-management') 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'text-gray-700 hover:bg-gray-100'
            ]"
            style="font-family: 'Pretendard', sans-serif;"
          >
            식단 분석
          </button>
          <button
            @click="navigateTo('/favorites')"
            :class="[
              'px-4 py-2 rounded-xl transition-all',
              isActive('/favorites') 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'text-gray-700 hover:bg-gray-100'
            ]"
            style="font-family: 'Pretendard', sans-serif;"
          >
            좋아하는 음식
          </button>
          <button
            @click="navigateTo('/meal-community')"
            :class="[
              'px-4 py-2 rounded-xl transition-all',
              isActive('/meal-community') 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'text-gray-700 hover:bg-gray-100'
            ]"
            style="font-family: 'Pretendard', sans-serif;"
          >
            식단 커뮤니티
          </button>
          <button
            @click="navigateTo('/characters')"
            :class="[
              'px-4 py-2 rounded-xl transition-all',
              isActive('/characters') 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'text-gray-700 hover:bg-gray-100'
            ]"
            style="font-family: 'Pretendard', sans-serif;"
          >
            푸디 도감
          </button>
        </div>

        <!-- 데스크톱 로그인/유저 정보 -->
        <div class="hidden md:flex items-center gap-2">
          <template v-if="isLoggedIn">
            <!-- 알림 아이콘 -->
            <div class="relative notification-container mr-2">
              <button 
                @click="toggleNotifications"
                class="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative"
              >
                <Bell :size="24" />
                <span v-if="notificationStore.hasUnread" class="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              <!-- 알림 드롭다운 -->
              <div v-if="showNotificationList" class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div class="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h4 class="font-bold text-gray-800 text-sm">알림</h4>
                  <button @click="notificationStore.clearAll()" class="text-xs text-gray-500 hover:text-emerald-600">모두 지우기</button>
                </div>
                <div class="max-h-80 overflow-y-auto">
                   <div v-if="notificationStore.notifications.length === 0" class="p-8 text-center text-gray-400 text-sm">
                      새로운 알림이 없습니다.
                   </div>
                     <div v-else>
                      <div 
                        v-for="noti in notificationStore.notifications" 
                        :key="noti.id"
                        class="p-4 hover:bg-gray-50 border-b border-gray-50 cursor-pointer transition-colors"
                        @click="showNotificationList = false"
                      >
                        <div class="flex justify-between items-start mb-1">
                          <span class="font-bold text-emerald-600 text-xs">[{{ noti.reportDate }}] 분석 상담 알림</span>
                          <span class="text-xs text-gray-400">{{ noti.time.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) }}</span>
                        </div>
                        <div class="flex justify-between items-start mb-1">
                          <span class="text-emerald-600 text-xs">From: {{ noti.senderId }}</span>
                        </div>
                        <p class="text-sm text-gray-700 line-clamp-2">{{ noti.message }}</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <button
              @click="navigateTo('/my-page')"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-xl transition-all',
                isActive('/my-page') 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              ]"
            >
              <User :size="20" />
              <span>{{ userName }}</span>
            </button>
            <button
              v-if="isAdmin"
              @click="navigateTo('/admin')"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-xl transition-all',
                isActive('/admin')
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-lg'
              ]"
            >
              <Shield :size="20" />
              <span>관리자</span>
            </button>
            <button
              @click="handleLogout"
              class="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut :size="20" />
              <span>로그아웃</span>
            </button>
          </template>
          <div v-else class="flex items-center gap-2">
            <button
              @click="navigateTo('/login')"
              class="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <LogIn :size="20" />
              <span>로그인</span>
            </button>
            <button
              @click="navigateTo('/signup')"
              class="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all font-medium"
            >
              회원가입
            </button>
          </div>
        </div>

        <!-- 모바일 햄버거 버튼 -->
        <button 
          @click="toggleMenu"
          class="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <Menu v-if="!isMenuOpen" :size="24" />
          <X v-else :size="24" />
        </button>
      </div>
    </div>

    <!-- 모바일 메뉴 드로어 -->
    <div 
      v-show="isMenuOpen"
      class="md:hidden border-t border-gray-100 bg-white"
    >
      <div class="px-4 py-2 space-y-1">
        <button
          @click="navigateTo('/')"
          :class="[
            'w-full text-left px-4 py-3 rounded-xl transition-all',
            isActive('/') 
              ? 'bg-emerald-50 text-emerald-700 font-medium' 
              : 'text-gray-700 hover:bg-gray-50'
          ]"
          style="font-family: 'Pretendard', sans-serif;"
        >
          홈
        </button>
        <button
          @click="navigateTo('/meal-management')"
          :class="[
            'w-full text-left px-4 py-3 rounded-xl transition-all',
            isActive('/meal-management') 
              ? 'bg-emerald-50 text-emerald-700 font-medium' 
              : 'text-gray-700 hover:bg-gray-50'
          ]"
          style="font-family: 'Pretendard', sans-serif;"
        >
          식단 분석
        </button>
        <button
          @click="navigateTo('/favorites')"
          :class="[
            'w-full text-left px-4 py-3 rounded-xl transition-all',
            isActive('/favorites') 
              ? 'bg-emerald-50 text-emerald-700 font-medium' 
              : 'text-gray-700 hover:bg-gray-50'
          ]"
          style="font-family: 'Pretendard', sans-serif;"
        >
          좋아하는 음식
        </button>
        <button
          @click="navigateTo('/meal-community')"
          :class="[
            'w-full text-left px-4 py-3 rounded-xl transition-all',
            isActive('/meal-community') 
              ? 'bg-emerald-50 text-emerald-700 font-medium' 
              : 'text-gray-700 hover:bg-gray-50'
          ]"
          style="font-family: 'Pretendard', sans-serif;"
        >
          식단 커뮤니티
        </button>
        <button
          @click="navigateTo('/characters')"
          :class="[
            'w-full text-left px-4 py-3 rounded-xl transition-all',
            isActive('/characters') 
              ? 'bg-emerald-50 text-emerald-700 font-medium' 
              : 'text-gray-700 hover:bg-gray-50'
          ]"
          style="font-family: 'Pretendard', sans-serif;"
        >
          푸디 도감
        </button>

        <div class="border-t border-gray-100 my-2 pt-2">
          <template v-if="isLoggedIn">
            <button
              @click="navigateTo('/my-page')"
              :class="[
                'w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all',
                isActive('/my-page') 
                  ? 'bg-emerald-50 text-emerald-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
              ]"
            >
              <User :size="20" />
              <span>{{ userName }}</span>
            </button>
            <button
              v-if="isAdmin"
              @click="navigateTo('/admin')"
              :class="[
                'w-full flex items-center gap-2 px-4 py-3 rounded-xl transition-all',
                isActive('/admin')
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-600 hover:bg-emerald-50'
              ]"
            >
              <Shield :size="20" />
              <span>관리자 페이지</span>
            </button>
            <button
              @click="handleLogout"
              class="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <LogOut :size="20" />
              <span>로그아웃</span>
            </button>
          </template>
          <div v-else class="space-y-2 p-2">
            <button
              @click="navigateTo('/login')"
              class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <LogIn :size="20" />
              <span>로그인</span>
            </button>
            <button
              @click="navigateTo('/signup')"
              class="w-full px-4 py-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all font-medium text-center"
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Global Notification Toast -->
    <div 
        v-if="showNotification" 
        class="fixed top-20 right-4 z-[9999] bg-white border-l-4 border-emerald-500 shadow-2xl rounded-r-lg p-4 max-w-sm w-full flex items-start gap-3 animate-slide-in-right transition-all duration-300 transform translate-x-0"
    >
        <div class="text-emerald-500 mt-1">
            <Bell :size="20" />
        </div>
        <div class="flex-1">
            <p class="text-emerald-600 font-medium text-sm">상담 메시지가 왔어요!</p>
            <p class="text-gray-800 font-medium text-sm">{{ notificationMessage }}</p>
        </div>
        <button @click="showNotification = false" class="text-gray-400 hover:text-gray-600 transition-colors">
            <X :size="16" />
        </button>
    </div>
  </nav>
</template>

<style scoped>
@keyframes slide-in-right {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out forwards;
}
</style>
