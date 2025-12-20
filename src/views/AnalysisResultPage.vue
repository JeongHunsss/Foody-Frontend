<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { User, Ruler, Weight, Activity, Calendar, TrendingUp, Apple, Trash2, List, MessageCircle } from 'lucide-vue-next'
import ChatModal from '@/components/ChatModal.vue'
import Navbar from '@/components/Navbar.vue'
import NutritionGauge from '@/components/NutritionGauge.vue'
import { reportApi } from '@/api/report.api'
import { userApi } from '@/api/user.api'
import { characterApi } from '@/api/character.api'
import type { ReportResponse, CharacterResponse } from '@/api/types'
import { showError } from '@/utils/errorHandler'
import ssassakFoody from '@/assets/characters/ssassak_foody.png'

const router = useRouter()
const route = useRoute()

// State
const isLoading = ref(true)
const reportData = ref<ReportResponse | null>(null)
const userName = ref('')
const characterData = ref<CharacterResponse | null>(null)
const allCharacters = ref<CharacterResponse[]>([])
const isChatOpen = ref(false)

// Fetch report data
onMounted(async () => {
  try {
    isLoading.value = true
    
    // Fetch all characters first
    allCharacters.value = await characterApi.getAllCharacters()
    
    // Get report ID from route params or fetch the latest report
    const reportId = route.params.id ? Number(route.params.id) : null
    
    let finalReportId: number
    
    if (reportId) {
      finalReportId = reportId
    } else {
      // Fetch the latest report ID from list
      const response = await reportApi.getReportList(1)
      if (response && response.content.length > 0) {
        finalReportId = response.content[0].id
      } else {
        throw new Error('분석 결과를 찾을 수 없습니다.')
      }
    }
    
    // Fetch full report details including meals
    reportData.value = await reportApi.getReportDetail(finalReportId)
    
    // Fetch user info for display
    const user = await userApi.getMyInfo()
    userName.value = user.name
    
    // Fetch character details if characterId exists
    if (reportData.value?.characterId) {
      characterData.value = allCharacters.value.find(
        c => c.id === reportData.value!.characterId
      ) || null
    }
    
  } catch (error: any) {
    console.error('Failed to load report:', error)
    alert(showError(error))
    router.push('/meal-management')
  } finally {
    isLoading.value = false
  }
})

// Computed properties for display
const analysisResult = computed(() => {
  if (!reportData.value) return null
  
  const report = reportData.value
  
  // Map activity level number to string
  const getActivityLevelKey = (level?: number): 'low' | 'moderate' | 'high' | 'very-high' => {
    if (!level) return 'moderate'
    if (level === 1) return 'low'
    if (level === 2) return 'moderate'
    if (level === 3) return 'high'
    return 'very-high'
  }
  
  return {
    id: report.id, // Need ID for something?
    userId: report.userId,
    expertId: report.expertId, // Add expertId
    expertName: report.expertName,
    userName: userName.value,
    userInfo: {
      name: userName.value,
      age: report.userAge || 0,
      height: report.userHeight || 0,
      weight: report.userWeight || 0,
      gender: report.userGender === 'M' ? 'male' as const : 'female' as const,
      activityLevel: getActivityLevelKey(report.userActivityLevel),
      isDiabetes: report.userIsDiabetes
    },
    score: report.score || 0,
    comment: report.comment || 'AI 분석 결과가 없습니다.',
    dailyTotals: {
      calories: Math.round(report.totalKcal || 0),
      carbs: Math.round((report.totalCarb || 0) * 10) / 10,
      protein: Math.round((report.totalProtein || 0) * 10) / 10,
      fat: Math.round((report.totalFat || 0) * 10) / 10,
      sugar: Math.round((report.totalSugar || 0) * 10) / 10,
      sodium: Math.round((report.totalNatrium || 0) * 10) / 10
    },
    recommended: {
      calories: Math.round(report.userStdKcal || 2000),
      carbs: Math.round((report.userStdCarb || 250) * 10) / 10,
      protein: Math.round((report.userStdProtein || 80) * 10) / 10,
      fat: Math.round((report.userStdFat || 60) * 10) / 10,
      sugar: Math.round((report.userStdSugar || 50) * 10) / 10,
      sodium: Math.round((report.userStdNatrium || 2) * 10) / 10
    },
    characterId: report.characterId || null,
    characterName: characterData.value?.name || '분석 중..',
    characterImg: characterData.value?.img || ssassakFoody,
    meals: (report.meals || []).map(meal => {
      const mealTypeMap: Record<string, 'breakfast' | 'lunch' | 'dinner' | 'snack'> = {
        'BREAKFAST': 'breakfast',
        'LUNCH': 'lunch',
        'DINNER': 'dinner',
        'SNACK': 'snack'
      }
      
      return {
        mealTime: mealTypeMap[meal.mealType] || 'breakfast',
        foods: (meal.mealFoods || []).map((mealFood, index) => ({
          id: String(index),
          name: mealFood.foodName || mealFood.userFoodName || '음식',
          category: mealFood.foodCategory || '기타',
          calories: Math.round((mealFood.eatenKcal || 0)),
          carbs: Math.round((mealFood.eatenCarb || 0) * 10) / 10,
          protein: Math.round((mealFood.eatenProtein || 0) * 10) / 10,
          fat: Math.round((mealFood.eatenFat || 0) * 10) / 10,
          sugar: Math.round((mealFood.eatenSugar || 0) * 10) / 10,
          sodium: Math.round((mealFood.eatenNatrium || 0) * 10) / 10,
          amount: Math.round(mealFood.eatenWeight || 0)
        })).filter(food => food.amount > 0),
        totals: {
          calories: Math.round(meal.totalKcal || 0),
          carbs: Math.round((meal.totalCarb || 0) * 10) / 10,
          protein: Math.round((meal.totalProtein || 0) * 10) / 10,
          fat: Math.round((meal.totalFat || 0) * 10) / 10,
          sugar: Math.round((meal.totalSugar || 0) * 10) / 10,
          sodium: Math.round((meal.totalNatrium || 0) * 10) / 10
        }
      }
    }),
    analysisDate: report.createdAt || new Date().toISOString(),
    isWaited: report.isWaited
  }
})

const mealTimeNames = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
  snack: '간식'
}

const activityLevelNames = {
  low: '낮음',
  moderate: '보통',
  high: '높음',
  'very-high': '매우 높음'
}

const handleDeleteReport = async () => {
  if (!reportData.value) return
  
  if (window.confirm('이 분석 레포트를 삭제하시겠습니까?')) {
    try {
      await reportApi.deleteReport(reportData.value.id)
      alert('레포트가 삭제되었습니다.')
      router.push('/my-page')
    } catch (error: any) {
      alert(showError(error))
    }
  }
}

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-emerald-600'
  if (score >= 75) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

const getScoreGradient = (score: number) => {
  if (score >= 90) return 'from-emerald-500 to-green-600'
  if (score >= 75) return 'from-green-500 to-emerald-600'
  if (score >= 60) return 'from-yellow-500 to-orange-500'
  if (score >= 40) return 'from-orange-500 to-red-500'
  return 'from-red-500 to-pink-600'
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-green-50">
    <Navbar />

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">분석 결과를 불러오는 중...</p>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="analysisResult">
      <!-- 서브 헤더 -->
      <div
        v-motion
        :initial="{ y: -20, opacity: 0 }"
        :enter="{ y: 0, opacity: 1 }"
        class="bg-white border-b border-gray-200"
      >
        <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 class="text-gray-900">식단 분석 결과</h1>
          <div class="flex items-center gap-2">
            <button
              @click="router.push('/my-page')"
              class="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
            >
              <List :size="20" />
              <span class="text-sm">레포트 목록</span>
            </button>

            <button
              @click="handleDeleteReport"
              class="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <Trash2 :size="20" />
              <span class="text-sm">삭제</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 분석 대기 중 알림 배너 -->
      <div 
        v-if="analysisResult?.isWaited"
        class="bg-amber-50 border-y border-amber-200"
      >
        <div class="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <div class="bg-amber-100 p-2 rounded-full flex-shrink-0 animate-pulse">
            <span class="text-xl">⏳</span>
          </div>
          <div>
            <h3 class="text-amber-900 font-bold">전문가 분석 대기 중</h3>
            <p class="text-amber-700 text-sm">영양 전문가가 회원님의 식단 기록을 분석하고 있습니다. 분석이 완료되면 코멘트와 점수가 업데이트됩니다.</p>
          </div>
        </div>
      </div>

      <!-- 전문가 분석 완료 알림 배너 -->
      <div 
        v-if="analysisResult?.expertId && !analysisResult?.isWaited"
        class="bg-blue-50 border-y border-blue-200"
      >
        <div class="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="bg-blue-100 p-2 rounded-full flex-shrink-0">
              <span class="text-2xl">👨‍⚕️</span>
            </div>
            <div>
              <h3 class="text-blue-900 font-bold">전문가 분석 완료</h3>
              <p class="text-blue-700 text-sm">전문가에 의해 분석된 레포트입니다. 문의를 원하시면 1대1 채팅을 진행해주세요.</p>
            </div>
          </div>
          <button
             @click="isChatOpen = true"
             class="flex-shrink-0 flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <MessageCircle :size="20" />
            <span class="font-bold">전문가와 채팅</span>
          </button>
        </div>
      </div>

      <!-- 당뇨 환자 경고 배너 -->
      <div 
        v-if="analysisResult?.userInfo.isDiabetes"
        class="bg-red-50 border-y border-red-200"
      >
        <div class="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <div class="bg-red-100 p-2 rounded-full flex-shrink-0 animate-pulse">
            <span class="text-xl">⚠️</span>
          </div>
          <div>
            <h3 class="text-red-900 font-bold">당뇨 환자 주의 알림</h3>
            <p class="text-red-700 text-sm">본 결과는 참고용이며, 정확한 진단과 처방은 반드시 전문의와 상담하시기 바랍니다.</p>
          </div>
        </div>
      </div>

      <div class="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <!-- 점수 & 캐릭터 섹션 -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
        class="bg-white rounded-3xl shadow-lg p-8 border-2 border-emerald-100"
      >
        <div class="flex flex-col md:flex-row items-center gap-8">
          <!-- 캐릭터 -->
          <div class="flex-shrink-0">
            <div
              v-motion
              :animate="{
                y: [0, -10, 0],
              }"
              :transition="{
                duration: 2000,
                repeat: Infinity,
                ease: 'easeInOut'
              }"
              class="w-48 h-48 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center overflow-hidden"
            >
              <img 
                :src="analysisResult.characterImg" 
                :alt="analysisResult.characterName"
                class="w-full h-full object-contain"
              />
              </div>
            <p class="text-center mt-4 text-gray-700">{{ analysisResult.characterName }}</p>
          </div>

          <!-- 점수 & 코멘트 -->
          <div class="flex-1 space-y-4">
            <div>
              <p class="text-sm text-gray-500 mb-2">{{ analysisResult.userName }}님의 식단 점수</p>
              <div class="flex items-end gap-3">
                <div
                  v-motion
                  :initial="{ scale: 0 }"
                  :enter="{ scale: 1, transition: { type: 'spring', delay: 300 } }"
                  :class="getScoreColor(analysisResult.score)"
                >
                  <span class="text-6xl">{{ analysisResult.score }}</span>
                  <span class="text-3xl">점</span>
                </div>
                <span class="text-gray-400 text-xl mb-2">/ 100점</span>
              </div>
            </div>

            <!-- 점수 게이지 -->
            <div class="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                v-motion
                :initial="{ width: '0%' }"
                :enter="{ width: `${analysisResult.score}%`, transition: { duration: 1500, delay: 500 } }"
                :class="['h-full bg-gradient-to-r', getScoreGradient(analysisResult.score)]"
              ></div>
            </div>

            <!-- AI 코멘트 -->
            <div class="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border-2 border-emerald-200">
              <div class="flex items-start gap-3">
                <span class="text-3xl flex-shrink-0">💬</span>
                <div>
                  <p class="text-sm text-emerald-700 mb-2">푸디의 코멘트</p>
                  <p class="text-gray-700 leading-relaxed">{{ analysisResult.comment }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 하루 총 영양소 & 권장량 비교 -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
        class="bg-white rounded-3xl shadow-lg p-8"
      >
        <h2 class="text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp :size="24" class="text-emerald-600" />
          하루 영양소 섭취 현황
        </h2>

        <div class="grid md:grid-cols-2 gap-6">
          <NutritionGauge
            label="칼로리"
            :current="analysisResult.dailyTotals.calories"
            :recommended="analysisResult.recommended.calories"
            unit="kcal"
            color="bg-gradient-to-r from-purple-500 to-pink-500"
          />
          <NutritionGauge
            label="탄수화물"
            :current="analysisResult.dailyTotals.carbs"
            :recommended="analysisResult.recommended.carbs"
            unit="g"
            color="bg-gradient-to-r from-blue-500 to-cyan-500"
          />
          <NutritionGauge
            label="단백질"
            :current="analysisResult.dailyTotals.protein"
            :recommended="analysisResult.recommended.protein"
            unit="g"
            color="bg-gradient-to-r from-emerald-500 to-green-500"
          />
          <NutritionGauge
            label="지방"
            :current="analysisResult.dailyTotals.fat"
            :recommended="analysisResult.recommended.fat"
            unit="g"
            color="bg-gradient-to-r from-yellow-500 to-orange-500"
          />
          <NutritionGauge
            label="당류"
            :current="analysisResult.dailyTotals.sugar"
            :recommended="analysisResult.recommended.sugar"
            unit="g"
            color="bg-gradient-to-r from-pink-500 to-rose-500"
          />
          <NutritionGauge
            label="나트륨"
            :current="analysisResult.dailyTotals.sodium"
            :recommended="analysisResult.recommended.sodium"
            unit="g"
            color="bg-gradient-to-r from-indigo-500 to-purple-500"
          />
        </div>
      </div>

      <!-- 유저 정보 -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
        class="bg-white rounded-3xl shadow-lg p-8"
      >
        <h2 class="text-gray-900 mb-6 flex items-center gap-2">
          <User :size="24" class="text-emerald-600" />
          분석 당시 유저 정보
        </h2>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div class="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
            <Calendar :size="32" class="text-blue-600" />
            <div>
              <p class="text-xs text-gray-600">나이</p>
              <p class="text-gray-900">{{ analysisResult.userInfo.age }}세</p>
            </div>
          </div>

          <div class="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
            <Ruler :size="32" class="text-purple-600" />
            <div>
              <p class="text-xs text-gray-600">키</p>
              <p class="text-gray-900">{{ analysisResult.userInfo.height }}cm</p>
            </div>
          </div>

          <div class="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
            <Weight :size="32" class="text-green-600" />
            <div>
              <p class="text-xs text-gray-600">몸무게</p>
              <p class="text-gray-900">{{ analysisResult.userInfo.weight }}kg</p>
            </div>
          </div>

          <div class="flex items-center gap-3 p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl">
            <User :size="32" class="text-pink-600" />
            <div>
              <p class="text-xs text-gray-600">성별</p>
              <p class="text-gray-900">{{ analysisResult.userInfo.gender === 'male' ? '남성' : '여성' }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl">
            <Activity :size="32" class="text-orange-600" />
            <div>
              <p class="text-xs text-gray-600">활동량</p>
              <p class="text-gray-900">{{ activityLevelNames[analysisResult.userInfo.activityLevel] }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3 p-4 bg-gradient-to-br from-yellow-50 to-lime-50 rounded-2xl">
            <Calendar :size="32" class="text-yellow-600" />
            <div>
              <p class="text-xs text-gray-600">분석일</p>
              <p class="text-gray-900 text-sm">{{ new Date(analysisResult.analysisDate).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 끼니별 상세 정보 -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
        class="bg-white rounded-3xl shadow-lg p-8"
      >
        <h2 class="text-gray-900 mb-6 flex items-center gap-2">
          <Apple :size="24" class="text-emerald-600" />
          끼니별 상세 정보
        </h2>

        <div class="space-y-6">
          <div
            v-for="(meal, index) in analysisResult.meals"
            :key="meal.mealTime"
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :enter="{ opacity: 1, x: 0, transition: { delay: 500 + index * 100 } }"
            class="border-2 border-gray-200 rounded-2xl p-6 hover:border-emerald-300 transition-colors"
          >
            <!-- 끼니 헤더 -->
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-gray-900">{{ mealTimeNames[meal.mealTime] }}</h3>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span class="text-purple-600 font-medium">{{ meal.totals.calories }}kcal</span>
                <span class="text-blue-600">탄수화물 {{ meal.totals.carbs }}g</span>
                <span class="text-emerald-600">단백질 {{ meal.totals.protein }}g</span>
                <span class="text-orange-600">지방 {{ meal.totals.fat }}g</span>
                <span class="text-pink-600">당 {{ meal.totals.sugar }}g</span>
                <span class="text-indigo-600">나트륨 {{ meal.totals.sodium }}g</span>
              </div>
            </div>

            <!-- 음식 목록 -->
            <div v-if="meal.foods.length > 0" class="space-y-3">
              <div
                v-for="food in meal.foods"
                :key="food.id"
                class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors gap-3"
              >
                <div class="flex-1">
                  <p class="text-gray-900 font-medium">{{ food.name }}</p>
                  <p class="text-sm text-gray-500">{{ food.category }} · {{ food.amount }}g</p>
                </div>
                <div class="flex flex-wrap gap-3 text-sm items-center">
                  <span class="text-purple-600 font-medium">{{ food.calories }}kcal</span>
                  <span class="text-gray-300 hidden sm:inline">|</span>
                  <span class="text-blue-600">탄수화물 {{ food.carbs }}g</span>
                  <span class="text-emerald-600">단백질 {{ food.protein }}g</span>
                  <span class="text-orange-600">지방 {{ food.fat }}g</span>
                  <span class="text-pink-600">당 {{ food.sugar }}g</span>
                  <span class="text-indigo-600">나트륨 {{ food.sodium }}g</span>
                </div>
              </div>
            </div>
            
            <!-- 음식이 없을 경우 메시지 -->
            <div v-else class="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              음식이 없습니다.
            </div>
          </div>
        </div>
      </div>

      <!-- 다시 분석하기 버튼 -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 600 } }"
        class="flex justify-center gap-4"
      >
        <button
          @click="router.push('/meal-management')"
          class="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl hover:shadow-lg transition-all hover:scale-105"
        >
          새로운 식단 분석하기
        </button>
        <button
          @click="router.push('/characters')"
          class="px-8 py-4 bg-white text-emerald-600 border-2 border-emerald-500 rounded-2xl hover:bg-emerald-50 transition-all"
        >
          푸디 도감 보기
        </button>
      </div>
    </div>
    </div>
    <ChatModal 
      :is-open="isChatOpen"
      :report-id="analysisResult?.id"
      :user-name="userName"
      :partner-name="analysisResult?.expertName"
      :user-id="analysisResult?.userId || ''"
      @close="isChatOpen = false"
    />
  </div>
</template>
