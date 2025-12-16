<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import { foodApi } from '@/api/food.api'
import { showError } from '@/utils/errorHandler'
import { Upload, Camera } from 'lucide-vue-next'

const router = useRouter()

const selectedFile = ref<File | null>(null)
const previewUrl = ref('')
const isAnalyzing = ref(false)
const errorMessage = ref('')

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

const analyzeImage = async () => {
  if (!selectedFile.value) {
    alert('이미지를 선택해주세요')
    return
  }

  isAnalyzing.value = true
  errorMessage.value = ''

  try {
    const result = await foodApi.analyzeFood(selectedFile.value)
    
    // 분석 결과를 state로 전달하면서 결과 페이지로 이동
    router.push({
      name: 'analysis-result',
      params: { result: JSON.stringify(result) }
    })
  } catch (error) {
    errorMessage.value = showError(error)
  } finally {
    isAnalyzing.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />
    <main class="max-w-4xl mx-auto px-6 py-12">
      <h1 class="text-3xl text-gray-900 mb-4">식단 이미지 분석</h1>
      <p class="text-gray-600 mb-8">AI가 당신의 식단을 분석합니다</p>
      
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <!-- Error Message -->
        <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {{ errorMessage }}
        </div>

        <!-- Upload Area -->
        <div class="mb-6">
          <label
            for="file-upload"
            class="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-emerald-300 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors"
            :class="{ 'bg-emerald-50': previewUrl }"
          >
            <div v-if="!previewUrl" class="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload class="w-12 h-12 text-emerald-500 mb-3" />
              <p class="mb-2 text-sm text-gray-700">
                <span class="font-semibold">클릭하여 업로드</span> 또는 드래그 앤 드롭
              </p>
              <p class="text-xs text-gray-500">PNG, JPG (최대 10MB)</p>
            </div>
            <img
              v-else
              :src="previewUrl"
              alt="미리보기"
              class="max-h-60 object-contain rounded-lg"
            />
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileSelect"
            />
          </label>
        </div>

        <!-- Analyze Button -->
        <button
          @click="analyzeImage"
          :disabled="!selectedFile || isAnalyzing"
          class="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Camera :size="20" />
          <span>{{ isAnalyzing ? 'AI 분석 중...' : '분석 시작' }}</span>
        </button>
      </div>
    </main>
  </div>
</template>
