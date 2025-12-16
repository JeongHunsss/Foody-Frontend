<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, LogOut, LogIn, Shield } from 'lucide-vue-next'
import logoImage from '@/assets/foody_logo.png'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const isAdmin = computed(() => authStore.isAdmin)
const userName = computed(() => authStore.user?.name || '마이페이지')

const handleLogout = () => {
  if (window.confirm('로그아웃 하시겠습니까?')) {
    authStore.logout()
    router.push('/')
  }
}

const isActive = (path: string) => {
  return route.path === path
}
</script>

<template>
  <nav class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- 로고 -->
        <button
          @click="router.push('/')"
          class="hover:opacity-80 transition-opacity"
        >
          <img :src="logoImage" alt="Foody Logo" class="h-12 object-contain" />
        </button>

        <!-- 메뉴 링크 -->
        <div class="flex items-center gap-2">
          <button
            @click="router.push('/')"
            :class="[
              'px-4 py-2 rounded-xl transition-all',
              isActive('/') 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            홈
          </button>
          <button
            @click="router.push('/meal-management')"
            :class="[
              'px-4 py-2 rounded-xl transition-all',
              isActive('/meal-management') 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            식단 분석
          </button>
          <button
            @click="router.push('/characters')"
            :class="[
              'px-4 py-2 rounded-xl transition-all',
              isActive('/characters') 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            푸디 도감
          </button>
        </div>

        <!-- 로그인/유저 정보 -->
        <div class="flex items-center gap-2">
          <template v-if="isLoggedIn">
            <button
              @click="router.push('/my-page')"
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
              @click="router.push('/admin')"
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
              @click="router.push('/login')"
              class="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <LogIn :size="20" />
              <span>로그인</span>
            </button>
            <button
              @click="router.push('/signup')"
              class="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all font-medium"
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
