<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import animation1 from '@/assets/animation/analyze_animation1.png'
import animation2 from '@/assets/animation/analyze_animation2.png'
import animation3 from '@/assets/animation/analyze_animation3.png'
import animation4 from '@/assets/animation/analyze_animation4.png'
import animation5 from '@/assets/animation/analyze_animation5.png'
import animation6 from '@/assets/animation/analyze_animation6.png'
import animation7 from '@/assets/animation/analyze_animation7.png'

interface Props {
  isOpen: boolean
  isFinished?: boolean // 요청 완료 여부 (optional)
}

const props = defineProps<Props>()

// 이미지용 시퀀스 (이미지만 사용)
const IMAGE_SEQUENCE = [
  animation1, animation2, animation3, animation4, animation5, animation6
]

// 텍스트/게이지용 시퀀스 (텍스트만 사용)
const TEXT_SEQUENCE = [
  '푸디가 식단을 확인하고 있어요...',
  '영양소를 분석 중이에요...',
  '푸디가 맛있게 먹고 있어요...',
  '건강한 식습관을 확인 중...',
  '거의 다 됐어요...',
  '마지막 분석 중...'
]

const FINAL_TEXT = '분석을 완료하고 있어요...'

// 상태 분리
const imageStep = ref(0)
const textStep = ref(0)
const isShakePhase = ref(false) // 이미지 흔들림 단계
const isTextFinished = ref(false) // 텍스트 완료 단계

let imageTimer: NodeJS.Timeout | null = null
let textTimer: NodeJS.Timeout | null = null

const currentDisplay = computed(() => {
  // 이미지 소스 계산
  let img = IMAGE_SEQUENCE[0]
  if (isShakePhase.value) {
    img = animation7 // 흔들림 단계 (7번 이미지)
  } else {
    img = IMAGE_SEQUENCE[imageStep.value] || IMAGE_SEQUENCE[0]
  }

  // 텍스트 소스 계산
  let txt = TEXT_SEQUENCE[0]
  if (isTextFinished.value) {
    txt = FINAL_TEXT
  } else {
    txt = TEXT_SEQUENCE[textStep.value] || TEXT_SEQUENCE[0]
  }

  return { image: img, text: txt }
})

const progressWidth = computed(() => {
  if (isTextFinished.value) return '95%'
  return `${((textStep.value + 1) / TEXT_SEQUENCE.length) * 90}%`
})

watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    // 초기화
    imageStep.value = 0
    textStep.value = 0
    isShakePhase.value = false
    isTextFinished.value = false
    clearTimers()
    return
  }

  runImageLoop()
  runTextProgress()
})

const clearTimers = () => {
  if (imageTimer) clearTimeout(imageTimer)
  if (textTimer) clearTimeout(textTimer)
}

// 1. 이미지 루프 (빠르게, 무한 반복)
const runImageLoop = () => {
  if (!props.isOpen) return

  if (imageStep.value < IMAGE_SEQUENCE.length) {
    // 1~6번 순차 재생 (0.2초 간격)
    imageTimer = setTimeout(() => {
      imageStep.value++
      runImageLoop()
    }, 200)
  } else {
    // 6번 끝 -> 7번 흔들림 진입
    imageStep.value = 0 // 다음 루프를 위해 초기화해두되, 표시는 isShakePhase로 제어
    isShakePhase.value = true
    
    // 1초간 흔들림
    imageTimer = setTimeout(() => {
      isShakePhase.value = false
      runImageLoop()
    }, 1000)
  }
}

// 2. 텍스트/게이지 진행 (천천히, 1회성 + 백엔드 연동)
const runTextProgress = () => {
  if (!props.isOpen) return

  // 마지막 단계 바로 전까지만 자동 진행 (TEXT_SEQUENCE.length - 2는 '거의 다 됐어요...' 단계)
  // 즉, '마지막 분석 중...' 전까지만 진행하고 거기서 대기
  if (textStep.value < TEXT_SEQUENCE.length - 2) {
    // 다음 멘트로 넘어가기 (0.8초 간격 - 조금 더 빠르게)
    textTimer = setTimeout(() => {
      textStep.value++
      runTextProgress()
    }, 800)
  }
  // else: 여기서 타이머를 걸지 않고 멈춤 (백엔드 완료 신호 대기)
}

// 백엔드 완료 신호 감지
watch(() => props.isFinished, (newVal) => {
  if (newVal && props.isOpen) {
    finishAnimation()
  }
})

const finishAnimation = () => {
  // 즉시 '마지막 분석 중...' 혹은 완료 상태로 점프
  if (textTimer) clearTimeout(textTimer)
  
  // 마지막 멘트로 이동
  textStep.value = TEXT_SEQUENCE.length - 1 
  
  // 0.5초 뒤에 완료 상태(텍스트 고정, 게이지 100%)로 전환
  textTimer = setTimeout(() => {
    isTextFinished.value = true
  }, 500)
}

onUnmounted(() => {
  clearTimers()
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      ></div>
    </Transition>

    <Transition
      enter-active-class="transition-all duration-200"
      leave-active-class="transition-all duration-200"
      enter-from-class="opacity-0 scale-90"
      leave-to-class="opacity-0 scale-90"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
          <!-- 푸디 애니메이션 -->
          <div class="relative mb-6 flex justify-center">
            <img
              :src="currentDisplay.image"
              alt="푸디 분석 중"
              :class="[
                'w-64 h-64 object-contain',
                isShakePhase ? 'animate-shake' : ''
              ]"
            />
          </div>

          <!-- 텍스트 -->
          <div class="text-center">
            <h3 class="text-gray-900 mb-2">AI 식단 분석</h3>
            <p class="text-gray-600">{{ currentDisplay.text }}</p>
          </div>

          <!-- Progress Bar -->
          <div class="mt-6 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-300"
              :style="{ width: progressWidth }"
            ></div>
          </div>

          <!-- Loading dots -->
          <div class="flex justify-center gap-2 mt-6">
            <div
              v-for="i in 3"
              :key="i"
              class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
              :style="{ animationDelay: `${(i - 1) * 200}ms` }"
            ></div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 흔들림 애니메이션 (좌우) - 7번 이미지용 */
@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px) rotate(-5deg);
  }
  50% {
    transform: translateX(0);
  }
  75% {
    transform: translateX(5px) rotate(5deg);
  }
}

.animate-shake {
  animation: shake 1s ease-in-out infinite;
}
</style>
