<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Sparkles,
  Heart,
  ArrowRight,
  Scale,
  Flame,
  Wheat,
  Beef,
  Droplet,
  Candy
} from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'
import logoImage from '@/assets/foody_logo.png'
import defaultFoodyImage from '@/assets/characters/ssassak_foody.png'
import foodyEggImage from '@/assets/characters/foody_egg.png'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.user)

onMounted(async () => {
  await authStore.loadFromStorage()
})

// 백엔드에서 계산된 표준 영양정보 사용 (값 그대로)
const recommendedNutrition = computed(() => {
  if (!user.value) return null
  
  const userInfo = user.value as any // UserResponse with StdInfo
  
  console.log('User for nutrition:', userInfo) // 디버깅용
  
  return {
    weight: userInfo.stdWeight || userInfo.weight || 0,
    calories: userInfo.stdKcal || 0,
    carbs: userInfo.stdCarb || 0,
    protein: userInfo.stdProtein || 0,
    fat: userInfo.stdFat || 0,
    sugar: userInfo.stdSugar || 0,
    sodium: userInfo.stdNatrium || 0
  }
})

const currentFoodyImage = computed(() =>
  isLoggedIn.value ? defaultFoodyImage : foodyEggImage
)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50/40 via-emerald-50/30 to-teal-50/40">
    <!-- Navbar -->
    <Navbar />

    <!-- Hero Section -->
    <main class="max-w-7xl mx-auto px-6 py-20">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Left: Text Content -->
        <div
          v-motion
          :initial="{ opacity: 0, x: -30 }"
          :enter="{ opacity: 1, x: 0, transition: { duration: 600 } }"
        >
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
            class="inline-flex items-center gap-2 bg-emerald-100/60 px-4 py-2 rounded-full mb-6 border border-emerald-200"
          >
            <Sparkles :size="16" class="text-emerald-600" />
            <span class="text-sm text-emerald-700">AI 기반 식단 분석</span>
          </div>

          <h1 class="text-gray-900 mb-4">
            푸디와 함께하는<br />
            <span class="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              건강한 식단 관리
            </span>
          </h1>

          <p class="text-xl text-gray-600 mb-8 leading-relaxed">
            당신의 식단을 분석하고, 푸디가 함께 자라나요!<br />
            AI가 영양소를 분석하고 맞춤형 조언을 제공합니다.
          </p>

          <div class="flex flex-wrap gap-4">
            <RouterLink to="/meal-management">
              <button
                v-motion
                :initial="{ scale: 1 }"
                :hovered="{ scale: 1.05 }"
                :tapped="{ scale: 0.95 }"
                class="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
              >
                <span>식단 분석 시작하기</span>
                <ArrowRight :size="20" />
              </button>
            </RouterLink>
            <RouterLink :to="isLoggedIn ? '/my-page' : '/signup'">
              <button
                v-motion
                :initial="{ scale: 1 }"
                :hovered="{ scale: 1.05 }"
                :tapped="{ scale: 0.95 }"
                class="px-8 py-4 bg-white text-gray-700 rounded-xl border-2 border-emerald-200 hover:border-emerald-300 transition-colors"
              >
                {{ isLoggedIn ? '내 레포트 보기' : '무료로 시작하기' }}
              </button>
            </RouterLink>
          </div>

          <!-- Stats / Recommended Nutrition -->
          <div class="mt-12">
            <div
              v-if="isLoggedIn"
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
              class="bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl p-6 border border-emerald-100/60 shadow-lg"
            >
              <div class="flex items-center gap-2 mb-6">
                <Heart :size="20" class="text-emerald-600" />
                <h3 class="text-gray-800">나의 권장 영양 정보</h3>
              </div>

              <div v-if="user?.role === 'ROLE_GUEST'" class="bg-amber-50 rounded-xl p-8 text-center border border-amber-200">
                <div class="flex flex-col items-center justify-center gap-2">
                  <span class="text-3xl">⚠️</span>
                  <p class="text-amber-700 font-medium text-lg">기본 정보 입력이 필요합니다.</p>
                  <RouterLink to="/my-page" class="text-sm text-amber-600 underline hover:text-amber-800 transition-colors mt-1">
                    내 정보 입력하러 가기 &rarr;
                  </RouterLink>
                </div>
              </div>

              <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <!-- 영양 정보 카드들 -->
                <div
                  v-if="recommendedNutrition"
                  v-for="(item, idx) in [
                    { icon: Scale, label: '몸무게', value: recommendedNutrition.weight, unit: 'kg', color: 'blue' },
                    { icon: Flame, label: '칼로리', value: recommendedNutrition.calories, unit: 'kcal', color: 'orange' },
                    { icon: Wheat, label: '탄수화물', value: recommendedNutrition.carbs, unit: 'g', color: 'amber' },
                    { icon: Beef, label: '단백질', value: recommendedNutrition.protein, unit: 'g', color: 'red' },
                    { icon: Droplet, label: '지방', value: recommendedNutrition.fat, unit: 'g', color: 'yellow' },
                    { icon: Candy, label: '당', value: recommendedNutrition.sugar, unit: 'g', color: 'pink' },
                    { label: '나트륨', value: recommendedNutrition.sodium, unit: 'g', color: 'purple', emoji: '🧂' }
                  ]"
                  :key="item.label"
                  v-motion
                  :initial="{ opacity: 0, scale: 0.9 }"
                  :enter="{ opacity: 1, scale: 1, transition: { delay: 450 + idx * 50 } }"
                  class="bg-white rounded-xl p-4 border border-emerald-100/50 hover:border-emerald-200 transition-all hover:shadow-md"
                >
                  <div class="flex items-center gap-2 mb-2">
                    <div :class="`w-8 h-8 rounded-lg bg-gradient-to-br from-${item.color}-100 to-${item.color}-200 flex items-center justify-center`">
                      <component v-if="item.icon" :is="item.icon" :size="16" :class="`text-${item.color}-600`" />
                      <span v-else class="text-sm">{{ item.emoji }}</span>
                    </div>
                    <div class="text-xs text-gray-500">{{ item.label }}</div>
                  </div>
                  <div class="text-xl text-gray-900">
                    {{ item.value }}<span class="text-sm text-gray-500 ml-1">{{ item.unit }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Foody Preview -->
        <div
          v-motion
          :initial="{ opacity: 0, x: 30 }"
          :enter="{ opacity: 1, x: 0, transition: { duration: 600, delay: 200 } }"
          class="relative"
        >
          <div class="absolute inset-0 bg-emerald-400/20 blur-3xl rounded-full"></div>
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
            :src="currentFoodyImage"
            :alt="isLoggedIn ? '새싹 푸디' : '푸디알'"
            class="relative w-full max-w-md mx-auto drop-shadow-2xl"
          />
        </div>
      </div>

      <!-- Features Section -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 40 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 800, duration: 600 } }"
        class="mt-32"
      >
        <div class="text-center mb-12">
          <h2 class="text-gray-900 mb-4">Foody만의 특별한 기능</h2>
          <p class="text-gray-600">식단 관리가 즐거워지는 순간</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white rounded-2xl p-8 border border-emerald-100/60 shadow-lg hover:shadow-xl transition-shadow">
            <div class="w-14 h-14 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center mb-4">
              <span class="text-3xl">🍽️</span>
            </div>
            <h3 class="text-gray-800 mb-3">다양한 식단 입력 방법</h3>
            <p class="text-gray-600">
              음식 검색, 직접 입력, AI 이미지 분석까지 원하는 방법으로 식단을 기록하세요.
            </p>
          </div>

          <div class="bg-white rounded-2xl p-8 border border-emerald-100/60 shadow-lg hover:shadow-xl transition-shadow">
            <div class="w-14 h-14 bg-gradient-to-br from-green-100 to-teal-100 rounded-2xl flex items-center justify-center mb-4">
              <span class="text-3xl">🌱</span>
            </div>
            <h3 class="text-gray-800 mb-3">푸디 성장 시스템</h3>
            <p class="text-gray-600">
              식단에 따라 푸디가 다양한 모습으로 성장하는 재미를 경험하세요.
            </p>
          </div>

          <div class="bg-white rounded-2xl p-8 border border-emerald-100/60 shadow-lg hover:shadow-xl transition-shadow">
            <div class="w-14 h-14 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-4">
              <span class="text-3xl">🤖</span>
            </div>
            <h3 class="text-gray-800 mb-3">AI 영양 분석</h3>
            <p class="text-gray-600">
              AI가 식습관을 분석하고 맞춤형 피드백을 제공해요. 전문가 분석도 선택 가능합니다.
            </p>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white/80 border-t border-emerald-100/50 mt-20">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-3">
            <img :src="logoImage" alt="Foody Logo" class="h-10 object-contain" />
            <span class="text-sm text-gray-500">© 2025 SSAFY-Foody. All rights reserved.</span>
          </div>
          <div class="flex gap-6 text-sm text-gray-600">
            <a href="#" class="hover:text-emerald-600 transition-colors">개인정보처리방침</a>
            <a href="#" class="hover:text-emerald-600 transition-colors">이용약관</a>
            <a href="#" class="hover:text-emerald-600 transition-colors">고객센터</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
