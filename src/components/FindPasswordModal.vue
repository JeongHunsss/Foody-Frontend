<script setup lang="ts">
import { ref } from 'vue'
import { X, Lock, Mail, User, Key, ArrowRight, CheckCircle } from 'lucide-vue-next'
import { authApi } from '@/api/auth.api'
import { showError } from '@/utils/errorHandler'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const step = ref<1 | 2 | 3>(1) // 1: 아이디+이메일 입력, 2: 인증번호 입력, 3: 완료
const userId = ref('')
const email = ref('')
const code = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

// 인증번호 발송
const handleSendCode = async () => {
  if (!userId.value || !email.value) {
    errorMessage.value = '아이디와 이메일을 모두 입력해주세요.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await authApi.sendCodeForFindPassword(userId.value, email.value)
    step.value = 2
    alert('인증번호가 이메일로 발송되었습니다.')
  } catch (error) {
    errorMessage.value = showError(error)
  } finally {
    isLoading.value = false
  }
}

// 인증번호 검증 및 임시 비밀번호 발급
const handleVerifyCode = async () => {
  if (!code.value) {
    errorMessage.value = '인증번호를 입력해주세요.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await authApi.resetPassword({
      id: userId.value,
      email: email.value,
      code: code.value
    })
    step.value = 3
  } catch (error) {
    errorMessage.value = showError(error)
  } finally {
    isLoading.value = false
  }
}

// 모달 닫기
const handleClose = () => {
  step.value = 1
  userId.value = ''
  email.value = ''
  code.value = ''
  errorMessage.value = ''
  emit('close')
}

// 재전송
const handleResend = async () => {
  code.value = ''
  errorMessage.value = ''
  await handleSendCode()
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click.self="handleClose"
  >
    <div
      v-motion
      :initial="{ opacity: 0, scale: 0.95 }"
      :enter="{ opacity: 1, scale: 1 }"
      class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative"
    >
      <!-- 닫기 버튼 -->
      <button
        @click="handleClose"
        class="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X :size="24" />
      </button>

      <!-- 헤더 -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-3">
          <div class="bg-emerald-100 p-3 rounded-xl">
            <Lock :size="24" class="text-emerald-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900">비밀번호 찾기</h2>
        </div>
        <p class="text-gray-600 text-sm">
          {{
            step === 1
              ? '아이디와 가입 시 등록한 이메일을 입력해주세요.'
              : step === 2
              ? '이메일로 발송된 인증번호를 입력해주세요.'
              : '임시 비밀번호가 이메일로 발송되었습니다.'
          }}
        </p>
      </div>

      <!-- 에러 메시지 -->
      <div
        v-if="errorMessage"
        class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
      >
        {{ errorMessage }}
      </div>

      <!-- Step 1: 아이디 + 이메일 입력 -->
      <div v-if="step === 1" class="space-y-4">
        <div>
          <label class="block text-sm text-gray-700 mb-2">아이디</label>
          <div class="relative flex items-center">
            <User class="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              v-model="userId"
              type="text"
              placeholder="아이디를 입력하세요"
              class="w-full pl-11 pr-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm text-gray-700 mb-2">이메일</label>
          <div class="relative flex items-center">
            <Mail class="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              v-model="email"
              type="email"
              placeholder="example@email.com"
              class="w-full pl-11 pr-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
              @keyup.enter="handleSendCode"
            />
          </div>
        </div>

        <button
          @click="handleSendCode"
          :disabled="isLoading"
          class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
        >
          {{ isLoading ? '발송 중...' : '인증번호 발송' }}
          <ArrowRight :size="20" v-if="!isLoading" />
        </button>
      </div>

      <!-- Step 2: 인증번호 입력 -->
      <div v-if="step === 2" class="space-y-6">
        <div>
          <label class="block text-sm text-gray-700 mb-2">인증번호</label>
          <div class="relative flex items-center">
            <Key class="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              v-model="code"
              type="text"
              placeholder="6자리 인증번호"
              maxlength="6"
              class="w-full pl-11 pr-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
              @keyup.enter="handleVerifyCode"
            />
          </div>
          <div class="flex justify-end mt-2">
            <button
              @click="handleResend"
              :disabled="isLoading"
              class="text-sm text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
            >
              인증번호 재전송
            </button>
          </div>
        </div>

        <button
          @click="handleVerifyCode"
          :disabled="isLoading"
          class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? '확인 중...' : '인증 확인' }}
        </button>
      </div>

      <!-- Step 3: 완료 -->
      <div v-if="step === 3" class="space-y-6">
        <div class="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-200 text-center">
          <div class="flex justify-center mb-4">
            <div class="bg-emerald-100 p-4 rounded-full">
              <CheckCircle :size="48" class="text-emerald-600" />
            </div>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">비밀번호 재설정 완료</h3>
          <p class="text-gray-700 mb-4">
            등록하신 이메일로<br />
            <span class="font-bold text-emerald-600">임시 비밀번호</span>가 발송되었습니다.
          </p>
          <p class="text-sm text-amber-600 bg-amber-50 rounded-lg p-3 border border-amber-200">
            ⚠️ 보안을 위해 로그인 후 반드시 비밀번호를 변경해주세요.
          </p>
        </div>

        <button
          @click="handleClose"
          class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
        >
          확인
        </button>
      </div>
    </div>
  </div>
</template>
