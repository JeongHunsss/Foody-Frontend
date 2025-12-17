<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { User, Lock } from 'lucide-vue-next'
import logoImage from '@/assets/foody_logo.png'
import { useAuthStore } from '@/stores/auth'
import { showError } from '@/utils/errorHandler'
import FindIdModal from '@/components/FindIdModal.vue'
import FindPasswordModal from '@/components/FindPasswordModal.vue'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

// 모달 상태
const isFindIdModalOpen = ref(false)
const isFindPasswordModalOpen = ref(false)

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  errorMessage.value = ''
  isLoading.value = true

  try {
    await authStore.login({
      id: username.value,
      password: password.value
    })
    router.push('/')
  } catch (error) {
    errorMessage.value = showError(error, 'Login')
  } finally {
    isLoading.value = false
  }
}

// OAuth2 소셜 로그인
const handleKakaoLogin = () => {
  window.location.href = 'http://localhost:8080/oauth2/authorization/kakao'
}

const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:8080/oauth2/authorization/google'
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50/40 via-emerald-50/30 to-teal-50/40 flex items-center justify-center p-6">
    <div
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :enter="{ opacity: 1, y: 0 }"
      class="w-full max-w-md"
    >
      <!-- Logo -->
      <div class="text-center mb-8">
        <RouterLink to="/">
          <img
            v-motion
            :hovered="{ scale: 1.05 }"
            :src="logoImage"
            alt="Foody Logo"
            class="h-20 mx-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity"
          />
        </RouterLink>
        <h1 class="text-gray-900 mb-2">로그인</h1>
        <p class="text-gray-600">푸디와 함께 건강한 식단을 시작하세요</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-3xl shadow-2xl p-8 border border-emerald-100/60">
        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {{ errorMessage }}
        </div>

        <!-- Form -->
        <form @submit="handleSubmit" class="space-y-5">
          <div>
            <label for="username" class="block text-sm text-gray-700 mb-2">아이디</label>
            <div class="relative flex items-center">
              <User class="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                id="username"
                v-model="username"
                type="text"
                placeholder="아이디를 입력하세요"
                class="w-full pl-11 pr-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                required
                :disabled="isLoading"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm text-gray-700 mb-2">비밀번호</label>
            <div class="relative flex items-center">
              <Lock class="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                id="password"
                v-model="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                class="w-full pl-11 pr-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                required
                :disabled="isLoading"
              />
            </div>
          </div>

          <!-- 아이디/비밀번호 찾기 -->
          <div class="flex justify-end gap-3 text-sm">
            <button 
              type="button" 
              @click="isFindIdModalOpen = true"
              class="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              아이디 찾기
            </button>
            <span class="text-gray-300">|</span>
            <button 
              type="button" 
              @click="isFindPasswordModalOpen = true"
              class="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              비밀번호 찾기
            </button>
          </div>

          <button
            v-motion
            :hovered="{ scale: 1.02 }"
            :tapped="{ scale: 0.98 }"
            type="submit"
            :disabled="isLoading"
            class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? '로그인 중...' : '로그인' }}
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-4 bg-white text-gray-500">또는</span>
          </div>
        </div>

        <!-- Social Login -->
        <div class="space-y-3">
          <button
            v-motion
            :hovered="{ scale: 1.02 }"
            :tapped="{ scale: 0.98 }"
            type="button"
            @click="handleKakaoLogin"
            class="w-full flex items-center justify-center gap-3 bg-[#FEE500] text-[#000000] py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3c-4.97 0-9 3.582-9 8 0 1.988.78 3.82 2.082 5.285-.27 1.103-.97 3.114-1.053 3.348-.098.276.097.567.39.567.068 0 .136-.016.197-.046.91-.445 2.362-1.164 3.268-1.59C8.927 18.84 10.426 19 12 19c4.97 0 9-3.582 9-8s-4.03-8-9-8z"/>
            </svg>
            카카오로 시작하기
          </button>

          <button
            v-motion
            :hovered="{ scale: 1.02 }"
            :tapped="{ scale: 0.98 }"
            type="button"
            @click="handleGoogleLogin"
            class="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            구글로 시작하기
          </button>
        </div>

        <!-- Signup Link -->
        <div class="mt-6 text-center text-sm">
          <span class="text-gray-600">아직 계정이 없으신가요? </span>
          <RouterLink to="/signup" class="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
            회원가입
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- 아이디 찾기 모달 -->
    <FindIdModal 
      :is-open="isFindIdModalOpen" 
      @close="isFindIdModalOpen = false" 
    />

    <!-- 비밀번호 찾기 모달 -->
    <FindPasswordModal 
      :is-open="isFindPasswordModalOpen" 
      @close="isFindPasswordModalOpen = false" 
    />
  </div>
</template>
