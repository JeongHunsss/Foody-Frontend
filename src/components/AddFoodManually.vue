<script setup lang="ts">
import { ref } from 'vue'
import { X, Plus } from 'lucide-vue-next'
import type { Food } from '@/types/food'

interface Emits {
  (e: 'close'): void
  (e: 'add', food: Food, amount: number): void
}

const emit = defineEmits<Emits>()

const name = ref('')
const servingSize = ref('')
const calories = ref('')
const carbs = ref('')
const protein = ref('')
const fat = ref('')
const sugar = ref('')
const sodium = ref('')
const eatenAmount = ref(100) // 먹은 양 기본값 100

const handleSubmit = () => {
  const newFood: Food = {
    code: `custom-${Date.now()}`,
    name: name.value,
    category: '직접입력',
    servingSize: servingSize.value,
    calories: Number(calories.value),
    carbs: Number(carbs.value),
    protein: Number(protein.value),
    fat: Number(fat.value),
    sugar: Number(sugar.value),
    sodium: Number(sodium.value),
  }

  // Save to localStorage
  const savedCustomFoods = localStorage.getItem('customFoods')
  const customFoods = savedCustomFoods ? JSON.parse(savedCustomFoods) : []
  customFoods.push(newFood)
  localStorage.setItem('customFoods', JSON.stringify(customFoods))

  emit('add', newFood, eatenAmount.value)
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
        class="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4"
        @click="emit('close')"
      >
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 scale-95 translate-y-8"
          leave-to-class="opacity-0 scale-95 translate-y-8"
        >
          <div
            class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            @click.stop
          >
            <!-- Header -->
            <div class="sticky top-0 bg-gradient-to-r from-emerald-500 to-green-600 p-6 rounded-t-3xl">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-white mb-1">음식 직접 입력</h2>
                </div>
                <button
                  @click="emit('close')"
                  class="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X :size="20" class="text-white" />
                </button>
              </div>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-700 mb-2">음식명 *</label>
                  <input
                    v-model="name"
                    type="text"
                    placeholder="예: 김치볶음밥"
                    class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label class="block text-sm text-gray-700 mb-2">영양소 기준량 (g) *</label>
                  <input
                    v-model="servingSize"
                    type="text"
                    placeholder="예: 100g"
                    class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                    required
                  />
                </div>
              </div>



              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-700 mb-2">칼로리 (kcal) *</label>
                  <input
                    v-model="calories"
                    type="number"
                    placeholder="0"
                    min="0"
                    step="1"
                    class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label class="block text-sm text-gray-700 mb-2">탄수화물 (g) *</label>
                  <input
                    v-model="carbs"
                    type="number"
                    placeholder="0"
                    min="0"
                    step="0.1"
                    class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                    required
                  />
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-700 mb-2">단백질 (g) *</label>
                  <input
                    v-model="protein"
                    type="number"
                    placeholder="0"
                    min="0"
                    step="0.1"
                    class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label class="block text-sm text-gray-700 mb-2">지방 (g) *</label>
                  <input
                    v-model="fat"
                    type="number"
                    placeholder="0"
                    min="0"
                    step="0.1"
                    class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                    required
                  />
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-700 mb-2">당 (g) *</label>
                  <input
                    v-model="sugar"
                    type="number"
                    placeholder="0"
                    min="0"
                    step="0.1"
                    class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label class="block text-sm text-gray-700 mb-2">나트륨 (g) *</label>
                  <input
                    v-model="sodium"
                    type="number"
                    placeholder="0"
                    min="0"
                    step="0.1"
                    class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                    required
                  />
                </div>
              </div>

               <!-- 먹은 양 입력 추가 -->
              <div>
                <label class="block text-sm text-gray-700 mb-2">먹은 양 (g) *</label>
                 <div class="relative">
                  <input
                    v-model.number="eatenAmount"
                    type="number"
                    min="1"
                    class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                    required
                  />
                  <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">g</span>
                </div>
              </div>

              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  @click="emit('close')"
                  class="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  class="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Plus :size="20" />
                  <span>추가하기</span>
                </button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

