<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, LogOut, LogIn, Shield, Menu, X } from 'lucide-vue-next'
import logoImage from '@/assets/foody_logo.png'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const isAdmin = computed(() => authStore.isAdmin)
const userName = computed(() => authStore.user?.name || '마이페이지')
const isMenuOpen = ref(false)

const handleLogout = async () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    await authStore.logout()
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
          >
            푸디 도감
          </button>
        </div>

        <!-- 데스크톱 로그인/유저 정보 -->
        <div class="hidden md:flex items-center gap-2">
          <template v-if="isLoggedIn">
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
  </nav>
</template>
