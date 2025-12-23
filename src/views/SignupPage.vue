<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Mail, Lock, User, Check, Send, Scale, Ruler, Calendar, Activity } from 'lucide-vue-next'
import logoImage from '@/assets/foody_logo.png'
import foodyEggImage from '@/assets/characters/foody_egg.png'
import { publicApi } from '@/api/public.api'
import { emailApi } from '@/api/email.api'
import type { ActivityLevelResponse } from '@/api/types'

const router = useRouter()

const username = ref('')
const isUsernameChecked = ref(false)
const isUsernameAvailable = ref(false)
const password = ref('')
const confirmPassword = ref('')
const name = ref('')
const email = ref('')
const isEmailSent = ref(false)
const verificationCode = ref('')
const age = ref('')
const height = ref('')
const weight = ref('')
const gender = ref<'male' | 'female' | ''>('')
const activityLevel = ref('3')
const hasDiabetes = ref(false)
const showWelcome = ref(false)

// 활동량 목록 (DB에서 로드)
const activityLevels = ref<ActivityLevelResponse[]>([])

// 활동량 목록 불러오기
onMounted(async () => {
  try {
    activityLevels.value = await publicApi.getActivityLevels()
    // 첫 번째 활동량을 기본값으로 설정 (또는 중간값)
    if (activityLevels.value.length  > 0) {
      const middleIndex = Math.floor(activityLevels.value.length / 2)
      activityLevel.value = activityLevels.value[middleIndex].level.toString()
    }
  } catch (error) {
    console.error('Failed to load activity levels:', error)
    // 실패시 기본 하드코딩 값 사용
  }
})

const isCheckingUsername = ref(false)

const handleUsernameCheck = async () => {
  if (!username.value) {
    alert('아이디를 입력해주세요.')
    return
  }

  const idRegex = /^[a-zA-Z0-9]+$/;
  if (!idRegex.test(username.value)) {
    alert('아이디는 영문과 숫자만 사용 가능합니다.')
    return
  }
  
  if (isCheckingUsername.value) return
  
  try {
    isCheckingUsername.value = true
    const isDuplicate = await authApi.checkIdDuplicate(username.value)
    isUsernameAvailable.value = !isDuplicate // true면 중복, false면 사용 가능
    isUsernameChecked.value = true
  } catch (error: any) {
    console.error('아이디 중복 체크 실패:', error)
    alert(showError(error))
  } finally {
    isCheckingUsername.value = false
  }
}

const isSendingEmail = ref(false)

const handleSendEmail = async () => {
  if (!email.value) {
    alert('이메일을 입력해주세요.')
    return
  }
  
  if (isSendingEmail.value) return
  
  try {
    isSendingEmail.value = true
    
    // 이메일 중복 체크
    const isDuplicate = await emailApi.checkEmailDuplicate(email.value)
    if (isDuplicate) {
      alert('이미 가입된 이메일입니다.')
      return
    }
    
    // 인증번호 발송
    const response = await emailApi.sendVerificationCode(email.value)
    isEmailSent.value = true
    // 서버 응답 메시지 표시
    alert(typeof response === 'string' ? response : '인증번호가 발송되었습니다.')
  } catch (error: any) {
    console.error('이메일 전송 실패:', error)
    alert(showError(error))
  } finally {
    isSendingEmail.value = false
  }
}

const isCodeVerified = ref(false)
const isVerifyingCode = ref(false)

const handleVerifyCode = async () => {
  if (!verificationCode.value) {
    alert('인증 코드를 입력해주세요.')
    return
  }
  
  if (verificationCode.value.length !== 6) {
    alert('인증 코드 6자리를 입력해주세요.')
    return
  }
  
  if (isVerifyingCode.value) return
  
  try {
    isVerifyingCode.value = true
    const response = await emailApi.verifyCode({
      email: email.value,
      code: verificationCode.value
    })
    isCodeVerified.value = true
    // 서버 응답 메시지 표시
    alert(typeof response === 'string' ? response : '이메일 인증이 완료되었습니다.')
  } catch (error: any) {
    console.error('인증 코드 검증 실패:', error)
    alert(showError(error))
  } finally {
    isVerifyingCode.value = false
  }
}

import { authApi } from '@/api/auth.api'
import { showError } from '@/utils/errorHandler'

// ...

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  
  if (!isUsernameChecked.value || !isUsernameAvailable.value) {
    alert('아이디 중복 체크를 해주세요.')
    return
  }
  
  if (!isEmailSent.value || !isCodeVerified.value) {
    alert('이메일 인증을 완료해주세요.')
    return
  }
  
  if (password.value !== confirmPassword.value) {
    alert('비밀번호가 일치하지 않습니다.')
    return
  }
  
  try {
    await authApi.signup({
      id: username.value,
      password: password.value,
      name: name.value,
      email: email.value,
      age: Number(age.value),
      height: Number(height.value),
      weight: Number(weight.value),
      gender: gender.value === 'male' ? 'M' : 'F',
      activityLevel: Number(activityLevel.value),
      isDiabetes: hasDiabetes.value
    })

    showWelcome.value = true
    
    // 잠시 후 로그인 페이지로 이동 (또는 바로 로그인 처리)
    setTimeout(() => {
      showWelcome.value = false
      router.push('/login')
    }, 2000)
  } catch (error) {
    alert(showError(error))
  }
}

</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50/40 via-emerald-50/30 to-teal-50/40 py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Left Side - Foody Egg Illustration -->
        <div class="hidden lg:flex flex-col items-center justify-center text-center">
          <div
            v-motion
            :initial="{ opacity: 0, scale: 0.8 }"
            :enter="{ opacity: 1, scale: 1, transition: { delay: 300 } }"
          >
            <img
              v-motion
              :initial="{ y: 0 }"
              :enter="{
                y: [0, -20, 0],
                transition: {
                  duration: 3000,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }
              }"
              :src="foodyEggImage"
              alt="푸디알"
              class="w-80 h-80 object-contain drop-shadow-2xl mx-auto mb-8"
            />
          </div>
          
          <h2
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 500 } }"
            class="text-3xl font-bold text-gray-900 mb-4"
          >
            푸디가 알에서 부화하기 직전이에요!
          </h2>
          <p
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 600 } }"
            class="text-gray-700 text-lg"
          >
            회원가입을 통해<br>
            푸디를 부화시켜주세요 🥚✨
          </p>
        </div>

        <!-- Right Side - Form -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0 }"
          class="w-full"
        >
      <!-- Logo -->
      <div class="text-center mb-8 flex flex-col items-center">
        <RouterLink to="/">
          <img
            v-motion
            :hovered="{ scale: 1.05 }"
            :src="logoImage"
            alt="Foody Logo"
            class="h-20 mx-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity"
          />
        </RouterLink>
        <h1 class="text-gray-900 mb-2">회원가입</h1>
        <p class="text-gray-600">건강한 식단 관리의 시작</p>
      </div>

      <!-- Signup Card -->
      <div class="bg-white rounded-3xl shadow-2xl p-8 border border-emerald-100/60 max-h-[70vh] overflow-y-auto">
        <!-- Form -->
        <form @submit="handleSubmit" class="space-y-5">
          <!-- 계정 정보 섹션 -->
          <div class="pb-4 border-b border-gray-200">
            <h3 class="text-lg text-gray-900 mb-4">계정 정보</h3>
            
            <!-- 아이디 -->
            <div class="mb-4">
              <label for="username" class="block text-sm text-gray-700 mb-2">아이디</label>
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <User class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    id="username"
                    v-model="username"
                    type="text"
                    placeholder="아이디 (영문, 숫자 4~20자)"
                    class="w-full pl-11 pr-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                    required
                    minlength="4"
                    maxlength="20"
                    @input="isUsernameChecked = false"
                  />
                </div>
                <button
                  v-motion
                  :hovered="{ scale: 1.02 }"
                  :tapped="{ scale: 0.98 }"
                  type="button"
                  @click="handleUsernameCheck"
                  :disabled="isCheckingUsername || (isUsernameChecked && isUsernameAvailable)"
                  :class="[
                    'px-5 py-3 rounded-xl transition-colors whitespace-nowrap',
                    isUsernameChecked && isUsernameAvailable
                      ? 'bg-emerald-500 text-white'
                      : isCheckingUsername
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  ]"
                >
                  {{ isCheckingUsername ? '확인중...' : (isUsernameChecked && isUsernameAvailable ? '✓ 사용가능' : '중복확인') }}
                </button>
              </div>
              <p
                v-if="isUsernameChecked"
                :class="['text-sm mt-2', isUsernameAvailable ? 'text-emerald-600' : 'text-red-600']"
              >
                {{ isUsernameAvailable ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.' }}
              </p>
            </div>

            <!-- 비밀번호 -->
            <div class="mb-4">
              <label for="password" class="block text-sm text-gray-700 mb-2">비밀번호</label>
              <div class="relative">
                <Lock class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  placeholder="••••••••"
                  class="w-full pl-11 pr-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                  required
                  minlength="8"
                />
              </div>
            </div>

            <!-- 비밀번호 확인 -->
            <div>
              <label for="confirmPassword" class="block text-sm text-gray-700 mb-2">비밀번호 확인</label>
              <div class="relative">
                <Lock class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  v-model="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  class="w-full pl-11 pr-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                  required
                  minlength="8"
                />
              </div>
              <p
                v-if="confirmPassword.length > 0"
                :class="['text-sm mt-2', password === confirmPassword ? 'text-emerald-600' : 'text-red-600']"
              >
                {{ password === confirmPassword ? '✓ 비밀번호가 일치합니다.' : '✗ 비밀번호가 일치하지 않습니다.' }}
              </p>
            </div>
          </div>

          <!-- 개인 정보 섹션 -->
          <div class="pb-4 border-b border-gray-200">
            <h3 class="text-lg text-gray-900 mb-4">개인 정보</h3>
            
            <!-- 이름 -->
            <div class="mb-4">
              <label for="name" class="block text-sm text-gray-700 mb-2">이름</label>
              <div class="relative">
                <User class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  v-model="name"
                  type="text"
                  placeholder="홍길동"
                  class="w-full pl-11 pr-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                  required
                  maxlength="50"
                />
              </div>
            </div>

            <!-- 이메일 -->
            <div class="mb-4">
              <label for="email" class="block text-sm text-gray-700 mb-2">이메일</label>
              <div class="flex gap-2 mb-2">
                <div class="relative flex-1">
                  <Mail class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    v-model="email"
                    type="email"
                    placeholder="your@email.com"
                    class="w-full pl-11 pr-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                    required
                    @input="isEmailSent = false"
                  />
                </div>
                <button
                  v-motion
                  :hovered="{ scale: 1.02 }"
                  :tapped="{ scale: 0.98 }"
                  type="button"
                  @click="handleSendEmail"
                  :disabled="isEmailSent || isSendingEmail"
                  :class="[
                    'px-5 py-3 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2',
                    isEmailSent
                      ? 'bg-emerald-500 text-white'
                      : isSendingEmail
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  ]"
                >
                  <Send :size="16" :class="{ 'animate-pulse': isSendingEmail }" />
                  {{ isSendingEmail ? '전송중...' : isEmailSent ? '전송완료' : '인증번호' }}
                </button>
              </div>
              <p v-if="isEmailSent" class="text-sm text-emerald-600 mb-2">
                인증 번호가 발송되었습니다.
              </p>
              <!-- 인증코드 -->
              <div v-if="isEmailSent" class="flex gap-2">
                <div class="relative flex-1">
                  <Check class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    id="verificationCode"
                    v-model="verificationCode"
                    type="text"
                    placeholder="인증 코드 6자리"
                    class="w-full pl-11 pr-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                    required
                    maxlength="6"
                  />
                </div>
                <button
                  v-motion
                  :hovered="{ scale: 1.02 }"
                  :tapped="{ scale: 0.98 }"
                  type="button"
                  @click="handleVerifyCode"
                  :disabled="isCodeVerified || isVerifyingCode"
                  :class="[
                    'px-5 py-3 rounded-xl transition-colors whitespace-nowrap',
                    isCodeVerified
                      ? 'bg-emerald-500 text-white'
                      : isVerifyingCode
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  ]"
                >
                  {{ isVerifyingCode ? '확인중...' : isCodeVerified ? '✓ 인증완료' : '코드확인' }}
                </button>
              </div>
              <p
                v-if="isCodeVerified"
                class="text-sm text-emerald-600 mt-2"
              >
                이메일 인증이 완료되었습니다.
              </p>
            </div>

            <!-- 나이, 성별 -->
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label for="age" class="block text-sm text-gray-700 mb-2">나이</label>
                <div class="relative">
                  <Calendar class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    id="age"
                    v-model="age"
                    type="number"
                    placeholder="25"
                    class="w-full pl-11 pr-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                    required
                    min="1"
                    max="120"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm text-gray-700 mb-2">성별</label>
                <div class="flex gap-2">
                  <button
                    type="button"
                    @click="gender = 'male'"
                    :class="[
                      'flex-1 py-3 rounded-xl border-2 transition-all',
                      gender === 'male'
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-white text-gray-700 border-emerald-100 hover:border-emerald-300'
                    ]"
                  >
                    남성
                  </button>
                  <button
                    type="button"
                    @click="gender = 'female'"
                    :class="[
                      'flex-1 py-3 rounded-xl border-2 transition-all',
                      gender === 'female'
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-white text-gray-700 border-emerald-100 hover:border-emerald-300'
                    ]"
                  >
                    여성
                  </button>
                </div>
              </div>
            </div>

            <!-- 키, 몸무게 -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="height" class="block text-sm text-gray-700 mb-2">키 (cm)</label>
                <div class="relative">
                  <Ruler class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    id="height"
                    v-model="height"
                    type="number"
                    placeholder="170"
                    class="w-full pl-11 pr-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                    required
                    min="1"
                    step="0.1"
                  />
                  <span class="absolute right-4 top-1/3 -translate-y-1/3 mt-0.5 text-gray-500">cm</span>
                </div>
              </div>
              <div>
                <label for="weight" class="block text-sm text-gray-700 mb-2">몸무게 (kg)</label>
                <div class="relative">
                  <Scale class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    id="weight"
                    v-model="weight"
                    type="number"
                    placeholder="65"
                    class="w-full pl-11 pr-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                    required
                    min="1"
                    step="0.1"
                  />
                  <span class="absolute right-4 top-1/3 -translate-y-1/3 mt-0.5 text-gray-500">kg</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 건강 정보 섹션 -->
          <div class="pb-4 border-b border-gray-200">
            <h3 class="text-lg text-gray-900 mb-4">건강 정보</h3>
            
            <!-- 활동량 -->
            <div class="mb-4">
              <label for="activityLevel" class="block text-sm text-gray-700 mb-2">활동량</label>
              <div class="relative">
                <Activity class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <select
                  id="activityLevel"
                  v-model="activityLevel"
                  class="w-full pl-11 pr-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors appearance-none bg-white cursor-pointer"
                  required
                >
                  <option v-if="activityLevels.length === 0" value="3">로딩 중...</option>
                  <option 
                    v-for="level in activityLevels" 
                    :key="level.level" 
                    :value="level.level"
                  >
                    {{ level.level }} - {{ level.description }}
                  </option>
                </select>
              </div>
            </div>

            <!-- 당뇨 여부 -->
            <div>
              <label class="flex items-center gap-3 cursor-pointer p-4 bg-emerald-50/50 rounded-xl hover:bg-emerald-50 transition-colors">
                <input
                  v-model="hasDiabetes"
                  type="checkbox"
                  class="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span class="text-gray-700">당뇨병이 있습니다</span>
              </label>
              <p v-if="hasDiabetes" class="text-xs text-amber-600 flex items-center gap-1 mt-2 pl-2">
                <span>⚠️</span> 당뇨가 있는 경우 의사의 진단이 필요합니다
              </p>
            </div>
          </div>

          <!-- 약관 동의 -->
          <div class="text-sm">
            <label class="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                class="w-4 h-4 mt-0.5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                required
              />
              <span class="text-gray-600">
                <a href="#" class="text-emerald-600 hover:text-emerald-700">이용약관</a> 및 
                <a href="#" class="text-emerald-600 hover:text-emerald-700">개인정보처리방침</a>에 동의합니다.
              </span>
            </label>
          </div>

          <button
            v-motion
            :hovered="{ scale: 1.02 }"
            :tapped="{ scale: 0.98 }"
            type="submit"
            class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            회원가입
          </button>
        </form>

        <!-- Login Link -->
        <div class="mt-6 text-center text-sm">
          <span class="text-gray-600">이미 계정이 있으신가요? </span>
          <RouterLink to="/login" class="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
            로그인
          </RouterLink>
        </div>
      </div>
        </div>
      </div>
    </div>

    <!-- Welcome Modal (간단 버전) -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-300"
        leave-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showWelcome"
          class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <div
            v-motion
            :initial="{ scale: 0.8, opacity: 0 }"
            :enter="{ scale: 1, opacity: 1 }"
            class="bg-white rounded-3xl shadow-2xl p-12 max-w-md text-center"
          >
            <div class="text-6xl mb-6">🎉</div>
            <h2 class="text-2xl text-gray-900 mb-4">환영합니다!</h2>
            <p class="text-gray-600">푸디와 함께 건강한 식단을 시작해보세요</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
