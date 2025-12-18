<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Trash2, BarChart3 } from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'
import FoodSearchModal from '@/components/FoodSearchModal.vue'
import AnalysisChoiceModal from '@/components/AnalysisChoiceModal.vue'
import AnalysisLoadingModal from '@/components/AnalysisLoadingModal.vue'
import type { MealTime, Food, MealItem } from '@/types/food'
import { showError } from '@/utils/errorHandler'

interface MealData {
  breakfast: MealItem[]
  lunch: MealItem[]
  dinner: MealItem[]
  snack: MealItem[]
}

const router = useRouter()

const meals = ref<MealData>({
  breakfast: [],
  lunch: [],
  dinner: [],
  snack: []
})

const isModalOpen = ref(false)
const selectedMealTime = ref<MealTime>('breakfast')
const isAnalysisChoiceModalOpen = ref(false)
const isAnalysisLoadingModalOpen = ref(false)

const MEAL_LABELS: Record<MealTime, string> = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
  snack: '간식'
}

const MEAL_COLORS: Record<MealTime, string> = {
  breakfast: 'from-amber-500 to-orange-500',
  lunch: 'from-emerald-500 to-green-600',
  dinner: 'from-blue-500 to-indigo-600',
  snack: 'from-pink-500 to-rose-500'
}

const MEAL_BG_COLORS: Record<MealTime, string> = {
  breakfast: 'bg-amber-50',
  lunch: 'bg-emerald-50',
  dinner: 'bg-blue-50',
  snack: 'bg-pink-50'
}

onMounted(() => {
  const savedMeals = localStorage.getItem('currentMeals')
  if (savedMeals) {
    meals.value = JSON.parse(savedMeals)
  }
})

watch(meals, (newMeals) => {
  localStorage.setItem('currentMeals', JSON.stringify(newMeals))
}, { deep: true })

const handleAddFood = (mealTime: MealTime) => {
  selectedMealTime.value = mealTime
  isModalOpen.value = true
}

const handleAddFoodToMeal = (food: Food, amount: number) => {
  meals.value[selectedMealTime.value].push({ food, amount })
  isModalOpen.value = false
}

const handleRemoveFood = (mealTime: MealTime, index: number) => {
  meals.value[mealTime] = meals.value[mealTime].filter((_, i) => i !== index)
}

// Helper to parse standard string (e.g. "100g" -> 100)
const parseStandard = (standard: string | undefined): number => {
  if (!standard) return 100
  const numStr = standard.replace(/[^0-9.]/g, '')
  return numStr ? Number(numStr) : 100
}

const totals = computed(() => {
  let totalCalories = 0
  let totalCarbs = 0
  let totalProtein = 0
  let totalFat = 0
  let totalSugar = 0
  let totalSodium = 0

  Object.values(meals.value).forEach((mealItems) => {
    mealItems.forEach(({ food, amount }) => {
      const standard = parseStandard(food.servingSize)
      const ratio = amount / standard

      totalCalories += food.calories * ratio
      totalCarbs += food.carbs * ratio
      totalProtein += food.protein * ratio
      totalFat += food.fat * ratio
      totalSugar += food.sugar * ratio
      totalSodium += food.sodium * ratio
    })
  })

  return {
    calories: Math.round(totalCalories),
    carbs: Math.round(totalCarbs * 10) / 10,
    protein: Math.round(totalProtein * 10) / 10,
    fat: Math.round(totalFat * 10) / 10,
    sugar: Math.round(totalSugar * 10) / 10,
    sodium: Math.round(totalSodium * 10) / 10
  }
})

const hasFoods = computed(() => {
  return Object.values(meals.value).some((mealItems) => mealItems.length > 0)
})

const handleAnalyze = () => {
  if (!hasFoods.value) {
    alert('음식을 먼저 추가해주세요.')
    return
  }
  isAnalysisChoiceModalOpen.value = true
}

const handleAnalyzeRequest = async (isWaited: boolean) => {
  isAnalysisChoiceModalOpen.value = false
  isAnalysisLoadingModalOpen.value = true
  
  try {
    // Import report API
    const { reportApi } = await import('@/api/report.api')
    
    // Build meal items array matching backend ReportRequest structure
    const reportMeals: any[] = []
    
    const mealTypeMap: Record<string, 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'> = {
      breakfast: 'BREAKFAST',
      lunch: 'LUNCH',
      dinner: 'DINNER',
      snack: 'SNACK'
    }

    Object.entries(meals.value).forEach(([mealTypeKey, items]) => {
      if (items.length === 0) return

      const foodItems = items.map((item) => {
        const standard = parseStandard(item.food.servingSize)
        return {
           foodCode: item.food.code.startsWith('custom-') ? null : item.food.code,
           name: item.food.name,
           eatenWeight: item.amount,
           standard: standard, // 기준량 전송
           
           // Base 영양소 정보 전송 (계산된 값 아님)
           kcal: item.food.calories,
           carb: item.food.carbs,
           protein: item.food.protein,
           fat: item.food.fat,
           sugar: item.food.sugar,
           natrium: item.food.sodium
        }
      })

      reportMeals.push({
        mealType: mealTypeMap[mealTypeKey],
        foods: foodItems
      })
    })
    
    // Submit to API
    await reportApi.createReport({ 
      isWaited: isWaited, 
      meals: reportMeals 
    })
    
    // Clear local storage
    localStorage.removeItem('currentMeals')
    
    setTimeout(() => {
      isAnalysisLoadingModalOpen.value = false
      router.push('/analyze/result')
    }, 3000)
  } catch (error: any) {
    isAnalysisLoadingModalOpen.value = false
    
    // 401 에러는 client.ts의 인터셉터에서 이미 처리함 (alert + redirect)
    if (error.response?.status === 401) {
      return
    }
    
    // GUEST 권한 등 추가 정보 필요 시 처리
    if (error.response?.status === 403 && error.response?.data?.code === 'NEED_ADDITIONAL_INFO') {
      alert('식단 분석을 위해서 추가 정보를 입력해주세요.')
      router.push('/my-page')
      return
    }

    alert(showError(error))
    console.error(error)
  }
}

const handleChooseAI = async () => {
  await handleAnalyzeRequest(false)
}

const handleChooseExpert = async () => {
  await handleAnalyzeRequest(true)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50/40 via-emerald-50/30 to-teal-50/40">
    <Navbar />

    <main class="max-w-7xl mx-auto px-6 py-8">
      <div class="mb-8">
        <h1 class="text-gray-900 mb-2">오늘의 식단</h1>
        <p class="text-gray-600">식사별로 음식을 추가하고 영양소를 확인하세요</p>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Left: Meal Sections -->
        <div class="lg:col-span-2 space-y-6">
          <div
            v-for="mealTime in ['breakfast', 'lunch', 'dinner', 'snack'] as MealTime[]"
            :key="mealTime"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :enter="{ opacity: 1, y: 0 }"
            class="bg-white rounded-2xl border border-emerald-100/60 shadow-lg overflow-hidden"
          >
            <!-- Meal Header -->
            <div :class="['bg-gradient-to-r', MEAL_COLORS[mealTime], 'px-6 py-4 flex items-center justify-between']">
              <h2 class="text-white">{{ MEAL_LABELS[mealTime] }}</h2>
              <button
                v-motion
                :hovered="{ scale: 1.05 }"
                :tapped="{ scale: 0.95 }"
                @click="handleAddFood(mealTime)"
                class="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center gap-2 transition-colors backdrop-blur-sm"
              >
                <Plus :size="16" />
                <span class="text-sm">음식 추가</span>
              </button>
            </div>

            <!-- Meal Content -->
            <div class="p-6">
              <div
                v-if="meals[mealTime].length === 0"
                :class="[MEAL_BG_COLORS[mealTime], 'rounded-xl p-8 text-center']"
              >
                <p class="text-gray-500">추가된 음식이 없습니다</p>
                <p class="text-sm text-gray-400 mt-1">음식 추가 버튼을 눌러 식단을 기록하세요</p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="(item, index) in meals[mealTime]"
                  :key="index"
                  v-motion
                  :initial="{ opacity: 0, x: -20 }"
                  :enter="{ opacity: 1, x: 0 }"
                  :leave="{ opacity: 0, x: 20 }"
                  class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div class="flex-1">
                    <div class="flex items-center gap-3">
                      <h3 class="text-gray-800">{{ item.food.name }}</h3>
                      <span class="text-sm text-gray-500">{{ item.amount }}g</span>
                    </div>
                    <div class="flex gap-4 mt-2 text-sm text-gray-600">
                      <span>{{ Math.round(item.food.calories * (item.amount / parseStandard(item.food.servingSize))) }}kcal</span>
                      <span>탄수화물 {{ Math.round(item.food.carbs * (item.amount / parseStandard(item.food.servingSize)) * 10) / 10 }}g</span>
                      <span>단백질 {{ Math.round(item.food.protein * (item.amount / parseStandard(item.food.servingSize)) * 10) / 10 }}g</span>
                      <span>지방 {{ Math.round(item.food.fat * (item.amount / parseStandard(item.food.servingSize)) * 10) / 10 }}g</span>
                      <span>당 {{ Math.round(item.food.sugar * (item.amount / parseStandard(item.food.servingSize)) * 10) / 10 }}g</span>
                      <span>나트륨 {{ Math.round(item.food.sodium * (item.amount / parseStandard(item.food.servingSize)) * 10) / 10 }}g</span>
                    </div>
                  </div>
                  <button
                    v-motion
                    :hovered="{ scale: 1.1 }"
                    :tapped="{ scale: 0.9 }"
                    @click="handleRemoveFood(mealTime, index)"
                    class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 :size="20" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Summary -->
        <div class="lg:col-span-1">
          <div class="sticky top-24">
            <div
              v-motion
              :initial="{ opacity: 0, x: 20 }"
              :enter="{ opacity: 1, x: 0 }"
              class="bg-white rounded-2xl border border-emerald-100/60 shadow-lg p-6"
            >
              <h2 class="text-gray-900 mb-6">전체 영양 정보</h2>

              <div v-if="hasFoods" class="space-y-4">
                <div class="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
                  <div class="text-sm text-gray-600 mb-1">총 칼로리</div>
                  <div class="text-3xl text-emerald-600">{{ totals.calories }}kcal</div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div class="p-3 bg-blue-50 rounded-lg">
                    <div class="text-xs text-gray-600 mb-1">탄수화물</div>
                    <div class="text-xl text-blue-600">{{ totals.carbs }}g</div>
                  </div>
                  <div class="p-3 bg-red-50 rounded-lg">
                    <div class="text-xs text-gray-600 mb-1">단백질</div>
                    <div class="text-xl text-red-600">{{ totals.protein }}g</div>
                  </div>
                  <div class="p-3 bg-yellow-50 rounded-lg">
                    <div class="text-xs text-gray-600 mb-1">지방</div>
                    <div class="text-xl text-yellow-600">{{ totals.fat }}g</div>
                  </div>
                  <div class="p-3 bg-pink-50 rounded-lg">
                    <div class="text-xs text-gray-600 mb-1">당</div>
                    <div class="text-xl text-pink-600">{{ totals.sugar }}g</div>
                  </div>
                  <div class="p-3 bg-purple-50 rounded-lg col-span-2">
                    <div class="text-xs text-gray-600 mb-1">나트륨</div>
                    <div class="text-xl text-purple-600">{{ totals.sodium }}g</div>
                  </div>
                </div>

                <button
                  v-motion
                  :hovered="{ scale: 1.02 }"
                  :tapped="{ scale: 0.98 }"
                  @click="handleAnalyze"
                  class="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
                >
                  <BarChart3 :size="20" />
                  <span>식단 분석하기</span>
                </button>
              </div>
              <div v-else class="text-center py-8">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 :size="32" class="text-gray-400" />
                </div>
                <p class="text-gray-500 text-sm">음식을 추가하면</p>
                <p class="text-gray-500 text-sm">영양 정보가 표시됩니다</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Food Search Modal -->
    <FoodSearchModal
      :is-open="isModalOpen"
      :meal-time="selectedMealTime"
      @close="isModalOpen = false"
      @add-food="handleAddFoodToMeal"
    />

    <!-- Analysis Choice Modal -->
    <AnalysisChoiceModal
      v-if="isAnalysisChoiceModalOpen"
      :is-open="isAnalysisChoiceModalOpen"
      @close="isAnalysisChoiceModalOpen = false"
      @choose-ai="handleChooseAI"
      @choose-expert="handleChooseExpert"
    />

    <!-- Analysis Loading Modal -->
    <AnalysisLoadingModal :is-open="isAnalysisLoadingModalOpen" />
  </div>
</template>
