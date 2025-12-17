<script setup lang="ts">
import { ref } from 'vue'
import { X, Mail, Key, ArrowRight } from 'lucide-vue-next'
import { authApi } from '@/api/auth.api'
import { showError } from '@/utils/errorHandler'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const step = ref<1 | 2>(1) // 1: 이메일 입력, 2: 인증번호 입력 & 아이디 표시
const email = ref('')
const code = ref('')
const foundId = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

// 인증번호 발송
const handleSendCode = async () => {
  if (!email.value) {
    errorMessage.value = '이메일을 입력해주세요.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await authApi.sendCodeForFindId(email.value)
    step.value = 2
    alert('인증번호가 이메일로 발송되었습니다.')
  } catch (error) {
    errorMessage.value = showError(error)
  } finally {
    isLoading.value = false
  }
}

// 인증번호 검증 및 아이디 찾기
const handleVerifyCode = async () => {
  if (!code.value) {
    errorMessage.value = '인증번호를 입력해주세요.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const userId = await authApi.verifyAndGetId({ email: email.value, code: code.value })
    foundId.value = userId
  } catch (error) {
    errorMessage.value = showError(error)
  } finally {
    isLoading.value = false
  }
}

// 모달 닫기
const handleClose = () => {
  step.value = 1
  email.value = ''
  code.value = ''
  foundId.value = ''
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
            <Mail :size="24" class="text-emerald-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900">아이디 찾기</h2>
        </div>
        <p class="text-gray-600 text-sm">
          {{ step === 1 ? '가입 시 등록한 이메일을 입력해주세요.' : '이메일로 발송된 인증번호를 입력해주세요.' }}
        </p>
      </div>

      <!-- 에러 메시지 -->
      <div
        v-if="errorMessage"
        class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
      >
        {{ errorMessage }}
      </div>

      <!-- Step 1: 이메일 입력 -->
      <div v-if="step === 1" class="space-y-6">
        <div>
          <label class="block text-sm text-gray-700 mb-2">이메일</label>
          <input
            v-model="email"
            type="email"
            placeholder="example@email.com"
            class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
            @keyup.enter="handleSendCode"
          />
        </div>

        <button
          @click="handleSendCode"
          :disabled="isLoading"
          class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {{ isLoading ? '발송 중...' : '인증번호 발송' }}
          <ArrowRight :size="20" v-if="!isLoading" />
        </button>
      </div>

      <!-- Step 2: 인증번호 입력 & 아이디 표시 -->
      <div v-if="step === 2" class="space-y-6">
        <div v-if="!foundId">
          <label class="block text-sm text-gray-700 mb-2">인증번호</label>
          <input
            v-model="code"
            type="text"
            placeholder="6자리 인증번호"
            maxlength="6"
            class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
            @keyup.enter="handleVerifyCode"
          />
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

        <!-- 아이디 표시 -->
        <div v-if="foundId" class="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-200">
          <div class="flex items-center gap-3 mb-3">
            <Key :size="20" class="text-emerald-600" />
            <h3 class="font-bold text-gray-900">찾은 아이디</h3>
          </div>
          <p class="text-2xl font-bold text-emerald-600 mb-2">{{ foundId }}</p>
          <p class="text-sm text-gray-600">위 아이디로 로그인하실 수 있습니다.</p>
        </div>

        <button
          v-if="!foundId"
          @click="handleVerifyCode"
          :disabled="isLoading"
          class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? '확인 중...' : '인증 확인' }}
        </button>

        <button
          v-if="foundId"
          @click="handleClose"
          class="w-full bg-gray-100 text-gray-700 py-4 rounded-xl hover:bg-gray-200 transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  </div>
</template>
