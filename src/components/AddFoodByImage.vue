<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Upload, Image as ImageIcon, Sparkles } from 'lucide-vue-next'
import type { Food } from '@/types/food'
import { foodApi } from '@/api/food.api'
import { showError } from '@/utils/errorHandler'

interface Props {
  isVisible: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'add', food: Food, amount: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedImage = ref<File | null>(null)
const previewUrl = ref('')
const isAnalyzing = ref(false)
const analyzedFoods = ref<Food[]>([])
const errorMessage = ref('')
const eatenAmount = ref(100) // 먹은 양 기본값 100

// Computed properties for better performance
const hasResults = computed(() => analyzedFoods.value.length > 0)
const showAnalyzeButton = computed(() => !isAnalyzing.value && !hasResults.value)

const handleImageSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedImage.value = file
    const url = URL.createObjectURL(file)
    previewUrl.value = url
    analyzedFoods.value = []
    errorMessage.value = ''
  }
}

const handleAnalyze = async () => {
  if (!selectedImage.value) return

  isAnalyzing.value = true
  errorMessage.value = ''

  try {
    const aiResult = await foodApi.analyzeFood(selectedImage.value)

    // 백엔드 AiFoodResponse -> 프론트 Food 타입으로 매핑
    const mappedFood: Food = {
      // 코드와 카테고리는 AI 분석 결과 특성상 프론트에서 임의로 지정
      code: `custom-${Date.now()}`,
      name: aiResult.name,
      category: '직접 입력',
      servingSize: aiResult.standard,
      calories: aiResult.kcal,
      carbs: aiResult.carb,
      protein: aiResult.protein,
      fat: aiResult.fat,
      sugar: aiResult.sugar,
      sodium: aiResult.natrium
    }

    analyzedFoods.value = [mappedFood]
  } catch (error) {
    errorMessage.value = showError(error)
  } finally {
    isAnalyzing.value = false
  }
}

const handleAddFood = (food: Food) => {
  emit('add', food, eatenAmount.value)
  // 추가 후 목록에서 제거
  analyzedFoods.value = analyzedFoods.value.filter(f => (f as any).code !== (food as any).code)
  
  if (analyzedFoods.value.length === 0) {
      emit('close')
  }
}

const handleReset = () => {
  selectedImage.value = null
  previewUrl.value = ''
  analyzedFoods.value = []
  isAnalyzing.value = false
  errorMessage.value = ''
  eatenAmount.value = 100 // 기본값으로 리셋
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
        v-if="isVisible"
        class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4"
        @click="emit('close')"
      >
        <!-- Modal Box -->
        <div class="w-full max-w-xl bg-white rounded-3xl overflow-hidden" @click.stop>
          <!-- Header -->
          <div class="bg-gradient-to-r from-emerald-500 to-green-600 p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles :size="20" class="text-white" />
                </div>
                <div>
                  <h2 class="text-white mb-1">AI 이미지 분석</h2>
                  <p class="text-sm text-white/90">사진을 업로드하면 AI가 음식을 분석해요</p>
                </div>
              </div>
              <button
                @click="emit('close')"
                class="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center"
              >
                <X :size="20" class="text-white" />
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-6">
            <div
              v-if="errorMessage"
              class="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"
            >
              {{ errorMessage }}
            </div>

            <!-- Upload -->
            <label v-if="!previewUrl" class="block">
              <input type="file" accept="image/*" @change="handleImageSelect" class="hidden" />
              <div class="border-3 border-dashed border-emerald-200 rounded-2xl p-12 text-center cursor-pointer">
                <Upload :size="64" class="text-emerald-400 mx-auto mb-4" />
                <p class="text-gray-700 mb-2">클릭하여 이미지 업로드</p>
                <p class="text-sm text-gray-500">또는 이미지를 드래그 앤 드롭</p>
              </div>
            </label>

            <div v-else class="space-y-4">
              <!-- Preview -->
              <div class="relative">
                <img :src="previewUrl" class="w-full h-64 object-cover rounded-2xl" />
                <button
                  @click="handleReset"
                  class="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <X :size="16" class="text-gray-700" />
                </button>
              </div>

              <button
                v-if="showAnalyzeButton"
                @click="handleAnalyze"
                class="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl"
              >
                AI로 분석하기
              </button>

              <div v-if="isAnalyzing" class="text-center py-8">
                <p class="text-gray-700 mb-2">AI가 분석 중...</p>
              </div>

              <div v-if="hasResults" class="space-y-3">
                <div v-for="food in analyzedFoods" :key="food.code" class="rounded-xl p-4 border">
                  <div class="flex items-center justify-between mb-3">
                    <div>
                      <h4 class="font-semibold">{{ food.name }}</h4>
                      <p class="text-sm text-gray-500">{{ food.servingSize }}</p>
                    </div>
                  </div>

                  <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs mb-4">
                    <div class="bg-emerald-50 rounded-lg p-2 text-center">
                      <div class="text-gray-600 mb-1">칼로리</div>
                      <div class="text-gray-900 font-semibold">{{ food.calories }} kcal</div>
                    </div>
                    <div class="bg-white rounded-lg p-2 text-center border">
                      <div class="text-gray-500 mb-1">탄수화물</div>
                      <div class="text-gray-800 font-semibold">{{ food.carbs }} g</div>
                    </div>
                    <div class="bg-white rounded-lg p-2 text-center border">
                      <div class="text-gray-500 mb-1">단백질</div>
                      <div class="text-gray-800 font-semibold">{{ food.protein }} g</div>
                    </div>
                    <div class="bg-white rounded-lg p-2 text-center border">
                      <div class="text-gray-500 mb-1">지방</div>
                      <div class="text-gray-800 font-semibold">{{ food.fat }} g</div>
                    </div>
                    <div class="bg-white rounded-lg p-2 text-center border">
                      <div class="text-gray-500 mb-1">당</div>
                      <div class="text-gray-800 font-semibold">{{ food.sugar }} g</div>
                    </div>
                    <div class="bg-white rounded-lg p-2 text-center border">
                      <div class="text-gray-500 mb-1">나트륨</div>
                      <div class="text-gray-800 font-semibold">{{ food.sodium }} mg</div>
                    </div>
                  </div>

                  <!-- 먹은 양 입력 필드 추가 -->
                  <div class="flex items-center gap-3 pt-3 border-t border-gray-200">
                    <div class="flex-1">
                      <label class="block text-xs text-gray-500 mb-1">먹은 양</label>
                      <div class="flex items-center gap-2">
                        <input
                          v-model.number="eatenAmount"
                          type="number"
                          min="1"
                          step="1"
                          class="w-24 px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:border-emerald-500 text-center"
                        />
                        <span class="text-sm text-gray-600">g</span>
                      </div>
                    </div>
                    <button 
                      @click="handleAddFood(food)" 
                      class="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors mt-5"
                    >
                      추가
                    </button>
                  </div>
                </div>

                <button @click="emit('close')" class="w-full px-6 py-3 bg-gray-100 rounded-xl">
                  완료
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>


