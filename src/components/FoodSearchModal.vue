<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Search, X, Plus, Heart, ChevronLeft, ChevronRight, Upload } from 'lucide-vue-next'
import { foodApi } from '@/api/food.api'
import type { Food, MealTime } from '@/types/food'
import AddFoodManually from './AddFoodManually.vue'
import AddFoodByImage from './AddFoodByImage.vue'

const ITEMS_PER_PAGE = 8

const MEAL_LABELS: Record<MealTime, string> = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
  snack: '간식'
}

interface Props {
  isOpen: boolean
  mealTime: MealTime
}

interface Emits {
  (e: 'close'): void
  (e: 'add-food', food: Food, amount: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const searchQuery = ref('')
const selectedCategory = ref('전체')
const currentPage = ref(1)
const foodAmounts = ref<Record<string, number>>({})
const favoriteFoods = ref<string[]>([])
const customFoods = ref<Food[]>([])
const showManualAdd = ref(false)
const showImageAdd = ref(false)

// API에서 가져온 음식 목록
const apiFoods = ref<Food[]>([])
const isLoading = ref(false)

// 카테고리 목록 (API에서 로드)
const categories = ref<string[]>([])

// 음식 목록 불러오기
const loadFoods = async (resetPage = false) => {
  if (resetPage) {
    currentPage.value = 1
  }
  
  isLoading.value = true
  try {
    // 특별 카테고리는 API 호출하지 않음
    if (selectedCategory.value === '찜한 음식' || selectedCategory.value === '직접 입력') {
      apiFoods.value = []
      totalPages.value = 1
      isLoading.value = false
      return
    }
    
    // API 카테고리 파라미터 설정
    const categoryParam = selectedCategory.value === '전체' ? undefined : selectedCategory.value
    
    const response = await foodApi.getFoodList(currentPage.value, searchQuery.value, categoryParam)
    console.log('API Response:', response) // 디버깅용
    
    // 페이지네이션 정보 업데이트
    totalPages.value = response.totalPages
    
    // getFoodList는 FoodListResponse 반환
    apiFoods.value = response.content.map((item: any) => ({
      code: item.code,
      name: item.name,
      category: item.category || '기타',
      servingSize: `${item.standard}`, // standard 필드 사용
      calories: item.kcal,
      carbs: item.carb, // carb 필드 사용
      protein: item.protein,
      fat: item.fat,
      sugar: item.sugar,
      sodium: item.natrium // natrium 필드 사용
    }))
    console.log('Converted foods:', apiFoods.value) // 디버깅용
    console.log('Total pages:', totalPages.value) // 디버깅용
  } catch (error) {
    console.error('Failed to load foods:', error)
  } finally {
    isLoading.value = false
  }
}

// 카테고리 목록 불러오기
const loadCategories = async () => {
  try {
    categories.value = await foodApi.getCategories()
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

onMounted(async () => {
  // 찜한 음식 & 커스텀 음식 불러오기
  const savedFavorites = localStorage.getItem('favoriteFoods')
  if (savedFavorites) {
    favoriteFoods.value = JSON.parse(savedFavorites)
  }

  const savedCustomFoods = localStorage.getItem('customFoods')
  if (savedCustomFoods) {
    customFoods.value = JSON.parse(savedCustomFoods)
  }

  // 음식 목록 및 카테고리 불러오기
  await Promise.all([loadFoods(), loadCategories()])
})

// 검색어 변경시 재로드
watch(searchQuery, async () => {
  await loadFoods(true) // 페이지 리셋
})

// 카테고리 변경시 재로드
watch(selectedCategory, async () => {
  await loadFoods(true) // 페이지 리셋
})

// 페이지 변경시 재로드
watch(currentPage, async () => {
  await loadFoods()
})

const toggleFavorite = (foodCode: string) => {
  if (favoriteFoods.value.includes(foodCode)) {
    favoriteFoods.value = favoriteFoods.value.filter(code => code !== foodCode)
  } else {
    favoriteFoods.value = [...favoriteFoods.value, foodCode]
  }
  localStorage.setItem('favoriteFoods', JSON.stringify(favoriteFoods.value))
}

// 전체 음식 목록 (API + customFoods)
const allFoods = computed(() => {
  // 특별 카테고리 처리
  if (selectedCategory.value === '찜한 음식') {
    // 찜한 음식만 표시 (apiFoods와 customFoods 모두에서)
    // customFoods는 id를 쓸 수도 있지만 API 호환성을 위해 code로 통일하는 것이 좋음 
    // (여기서는 customFoods 타입을 확인해야 하지만, 일단 code로 시도)
    return [...customFoods.value, ...apiFoods.value].filter(food => 
      favoriteFoods.value.includes(food.code)
    )
  }
  
  if (selectedCategory.value === '직접 입력') {
    // 직접 입력한 음식만 표시
    return customFoods.value
  }
  
  // 일반 카테고리(전체 포함) - API 결과만 표시
  return apiFoods.value
})

const filteredFoods = computed(() => {
  // 필터링은 이미 allFoods와 API에서 처리됨
  return allFoods.value
})

// 페이지네이션 - 백엔드에서 받은 totalPages 사용
const totalPages = ref(1)
const currentFoods = computed(() => filteredFoods.value)

// 표시할 페이지 번호 계산 (최대 5개)
const displayedPages = computed(() => {
  const pages: (number | string)[] = []
  const maxDisplay = 5
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + maxDisplay - 1)
  
  // 첫 페이지
  if (start > 1) {
    pages.push(1)
    if (start > 2) pages.push('...')
  }
  
  // 중간 페이지들
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  // 마지막 페이지
  if (end < totalPages.value) {
    if (end < totalPages.value - 1) pages.push('...')
    pages.push(totalPages.value)
  }
  
  return pages
})

watch(selectedCategory, () => {
  currentPage.value = 1
})

const getFoodAmount = (foodCode: string) => {
  return foodAmounts.value[foodCode] || 100
}

const setFoodAmount = (foodCode: string, amount: number) => {
  if (amount >= 1 && amount <= 10000) {
    foodAmounts.value[foodCode] = amount
  }
}

const handleAddFood = (food: Food, amount: number) => {
  emit('add-food', food, amount)
  emit('close')
  searchQuery.value = ''
  selectedCategory.value = '전체'
  currentPage.value = 1
  foodAmounts.value = {}
}

const handleClose = () => {
  emit('close')
}

const handleManualAdd = (food: Food) => {
  // customFoods 목록 업데이트
  const savedCustomFoods = localStorage.getItem('customFoods')
  customFoods.value = savedCustomFoods ? JSON.parse(savedCustomFoods) : []
  
  // 음식을 현재 식사에 추가
  emit('add-food', food, 100)
  showManualAdd.value = false
}

const handleImageAdd = (food: Food, amount: number) => {
  emit('add-food', food, amount)
  // 이미지 모달은 닫지 않음 (여러 음식 추가 가능)
}
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
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        @click="handleClose"
      ></div>
    </Transition>

    <Transition
      enter-active-class="transition-all duration-200"
      leave-active-class="transition-all duration-200"
      enter-from-class="opacity-0 scale-95 translate-y-5"
      leave-to-class="opacity-0 scale-95 translate-y-5"
    >
      <div
        v-if="isOpen"
        class="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
        @click.stop
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 flex items-center justify-between">
          <h2 class="text-white">{{ MEAL_LABELS[mealTime] }} - 음식 추가</h2>
          <button
            v-motion
            :hovered="{ scale: 1.1 }"
            :tapped="{ scale: 0.9 }"
            @click="handleClose"
            class="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X :size="20" class="text-white" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-3 mb-6">
            <button
              v-motion
              :hovered="{ scale: 1.02 }"
              :tapped="{ scale: 0.98 }"
              @click="showManualAdd = true"
              class="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
            >
              <Plus :size="16" />
              <span>직접 입력</span>
            </button>
            <button
              v-motion
              :hovered="{ scale: 1.02 }"
              :tapped="{ scale: 0.98 }"
              @click="showImageAdd = true"
              class="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
            >
              <Upload :size="16" />
              <span>사진으로 추가</span>
            </button>
          </div>

          <!-- Search Bar -->
          <div class="relative mb-6">
            <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="음식 이름으로 검색..."
              class="w-full pl-12 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <!-- Category Filter -->
          <div class="flex flex-wrap gap-2 mb-6">
            <button
              v-for="category in ['전체', '찜한 음식', '직접 입력', ...categories]"
              :key="category"
              v-motion
              :hovered="{ scale: 1.05 }"
              :tapped="{ scale: 0.95 }"
              @click="selectedCategory = category"
              :class="[
                'px-4 py-2 rounded-lg transition-all',
                selectedCategory === category
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ category }}
            </button>
          </div>

          <!-- Food List -->
          <div class="grid md:grid-cols-2 gap-4 mb-6">
            <div
              v-for="food in currentFoods"
              :key="food.code"
              v-motion
              :initial="{ opacity: 0, y: 20 }"
              :enter="{ opacity: 1, y: 0 }"
              class="bg-gradient-to-br from-emerald-50/50 to-green-50/50 rounded-xl p-4 border border-emerald-100 hover:border-emerald-300 transition-all hover:shadow-md"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <h3 class="text-gray-800 mb-1">{{ food.name }}</h3>
                  <span class="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs">
                    {{ food.category }}
                  </span>
                </div>
                <button
                  v-motion
                  :hovered="{ scale: 1.1 }"
                  :tapped="{ scale: 0.9 }"
                  @click="toggleFavorite(food.code)"
                  class="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <Heart
                    :size="20"
                    :class="[
                      favoriteFoods.includes(food.code) ? 'text-red-500 fill-red-500' : 'text-gray-400'
                    ]"
                  />
                </button>
              </div>

              <div class="text-sm text-gray-600 space-y-2 mb-3">
                <div class="flex justify-between">
                  <span>영양소 기준량</span>
                  <span class="text-gray-800">{{ food.servingSize }}</span>
                </div>
                <div class="flex justify-between">
                  <span>칼로리</span>
                  <span class="text-emerald-600">{{ food.calories }}kcal</span>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-emerald-100">
                  <div>
                    <div class="text-xs text-gray-500">탄수화물</div>
                    <div class="text-blue-600">{{ food.carbs }}g</div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-500">단백질</div>
                    <div class="text-red-600">{{ food.protein }}g</div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-500">지방</div>
                    <div class="text-yellow-600">{{ food.fat }}g</div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-500">당</div>
                    <div class="text-purple-600">{{ food.sugar }}g</div>
                  </div>
                  <div>
                    <div class="text-xs text-gray-500">나트륨</div>
                    <div class="text-orange-600">{{ food.sodium }}g</div>
                  </div>
                </div>
              </div>

              <!-- Amount Input and Add Button -->
              <div class="flex items-center gap-2 pt-3 border-t border-emerald-100">
                <div class="flex-1">
                  <label class="text-xs text-gray-500 mb-1 block">먹은 양</label>
                  <div class="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      step="1"
                      :value="getFoodAmount(food.code)"
                      @input="setFoodAmount(food.code, parseFloat(($event.target as HTMLInputElement).value) || 100)"
                      class="w-20 px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500 text-center"
                    />
                    <span class="text-sm text-gray-600">g</span>
                  </div>
                </div>
                <button
                  v-motion
                  :hovered="{ scale: 1.05 }"
                  :tapped="{ scale: 0.95 }"
                  @click="handleAddFood(food, getFoodAmount(food.code))"
                  class="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2 mt-5"
                >
                  <Plus :size="16" />
                  <span class="text-sm">추가</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center items-center gap-2">
            <button
              v-motion
              :hovered="{ scale: currentPage === 1 ? 1 : 1.1 }"
              :tapped="{ scale: currentPage === 1 ? 1 : 0.9 }"
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="p-2 rounded-lg bg-emerald-100 text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-200 transition-colors"
            >
              <ChevronLeft :size="20" />
            </button>

            <template v-for="(page, index) in displayedPages" :key="index">
              <span v-if="page === '...'" class="px-2 text-gray-400">...</span>
              <button
                v-else
                v-motion
                :hovered="{ scale: 1.1 }"
                :tapped="{ scale: 0.9 }"
                @click="currentPage = page as number"
                :class="[
                  'w-10 h-10 rounded-lg transition-colors',
                  currentPage === page
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ page }}
              </button>
            </template>

            <button
              v-motion
              :hovered="{ scale: currentPage === totalPages ? 1 : 1.1 }"
              :tapped="{ scale: currentPage === totalPages ? 1 : 0.9 }"
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="p-2 rounded-lg bg-emerald-100 text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-200 transition-colors"
            >
              <ChevronRight :size="20" />
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Manual Add Modal -->
    <AddFoodManually
      v-if="showManualAdd"
      @close="showManualAdd = false"
      @add="handleManualAdd"
    />

    <!-- Image Add Modal -->
    <AddFoodByImage
      :is-visible="showImageAdd"
      @close="showImageAdd = false"
      @add="handleImageAdd"
    />
  </Teleport>
</template>
