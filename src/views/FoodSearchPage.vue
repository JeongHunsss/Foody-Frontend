<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import { foodApi } from '@/api/food.api'
import type { FoodResponse } from '@/api/types'
import { showError } from '@/utils/errorHandler'
import { Search } from 'lucide-vue-next'

const foodList = ref<FoodResponse[]>([])
const keyword = ref('')
const currentPage = ref(1)
const isLoading = ref(false)
const errorMessage = ref('')

const searchFood = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const data = await foodApi.getFoodList(
      currentPage.value,
      keyword.value || undefined
    )
    foodList.value = data
  } catch (error) {
    errorMessage.value = showError(error)
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  searchFood()
}

onMounted(() => {
  searchFood()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    <main class="max-w-7xl mx-auto px-6 py-12">
      <h1 class="text-3xl text-gray-900 mb-8">음식 검색</h1>
      
      <!-- Search Box -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div class="flex gap-3">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="keyword"
              @keyup.enter="handleSearch"
              type="text"
              placeholder="음식을 검색하세요..."
              class="w-full pl-11 pr-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400"
            />
          </div>
          <button
            @click="handleSearch"
            :disabled="isLoading"
            class="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            {{ isLoading ? '검색중...' : '검색' }}
          </button>
        </div>
        
        <p v-if="errorMessage" class="text-red-600 text-sm mt-3">{{ errorMessage }}</p>
      </div>

      <!-- Results -->
      <div v-if="isLoading" class="text-center py-12 text-gray-500">
        로딩 중...
      </div>

      <div v-else-if="foodList.length === 0" class="text-center py-12 text-gray-500">
        검색 결과가 없습니다
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="food in foodList"
          :key="food.code"
          class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h3 class="text-lg text-gray-900 mb-2">{{ food.name }}</h3>
          <p class="text-sm text-gray-600 mb-3">{{ food.category }}</p>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">칼로리</span>
              <span class="text-gray-900">{{ food.kcal }} kcal</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">탄수화물</span>
              <span class="text-gray-900">{{ food.carb }} g</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">단백질</span>
              <span class="text-gray-900">{{ food.protein }} g</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">지방</span>
              <span class="text-gray-900">{{ food.fat }} g</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
