<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { reportApi } from '@/api/report.api'
import type { ReportResponse } from '@/api/types'
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'

const router = useRouter()
  const reports = ref<ReportResponse[]>([])
  const isLoading = ref(false)
  const currentPage = ref(1)
  const totalPages = ref(1)

  const fetchSharedReports = async (pageNum: number = 1) => {
    if (isLoading.value) return
    
    isLoading.value = true
    try {
      const response = await reportApi.getSharedReportList(pageNum)
      reports.value = response.content
      totalPages.value = response.totalPages
      currentPage.value = pageNum
    } catch (error) {
      console.error('Failed to fetch community feed', error)
    } finally {
      isLoading.value = false
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages.value && newPage !== currentPage.value) {
      fetchSharedReports(newPage)
      // Scroll to top when page changes
      const mainElement = document.querySelector('main')
      if (mainElement) {
        mainElement.scrollTop = 0
      }
    }
  }

  onMounted(() => {
    fetchSharedReports(1)
  })
</script>

<template>
  <div class="h-full bg-gray-50 flex flex-col overflow-hidden">
    <!-- Navbar -->
    <Navbar></Navbar>

    <!-- Content -->
    <main class="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
      <div class="max-w-5xl mx-auto space-y-4">
        <div class="flex items-center justify-between px-2 py-4">
          <h1 class="text-2xl font-bold text-gray-900" style="font-family: 'YeogiOttaeJalnan', sans-serif;">식단 커뮤니티</h1>
          
          <!-- Pagination Controls -->
          <div v-if="!isLoading && reports.length > 0" class="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-2">
            <button
              @click="handlePageChange(currentPage - 1)"
              :disabled="currentPage === 1"
              class="text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="이전 페이지"
            >
              <ChevronLeft :size="18" />
            </button>
            
            <span class="text-sm text-gray-700 font-medium">
              {{ currentPage }} / {{ totalPages }}
            </span>
            
            <button
              @click="handlePageChange(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="다음 페이지"
            >
              <ChevronRight :size="18" />
            </button>
          </div>
        </div>
        
        <div 
          v-for="report in reports" 
          :key="report.id"
          class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          @click="router.push(`/analyze/result/${report.id}`)"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                {{ report.userId.substring(0, 2).toUpperCase() }}
              </div>
              <div>
                <p class="text-sm font-bold text-gray-800">{{ report.userId }}님의 식단</p>
                <p class="text-xs text-gray-400">{{ formatDate(report.createdAt) }}</p>
              </div>
            </div>
            <div class="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-lg font-bold">
              {{ report.score }} 점
            </div>
          </div>

          <!-- Nutrient Summary -->
          <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
            <div class="bg-purple-50 rounded-xl p-3 text-center">
              <p class="text-xs text-purple-600 font-bold mb-1">칼로리</p>
              <p class="text-sm font-bold text-gray-800" style="font-family: 'Pretendard'">{{ Math.round(report.totalKcal) }}</p>
            </div>
            <div class="bg-blue-50 rounded-xl p-3 text-center">
              <p class="text-xs text-blue-600 font-bold mb-1">탄수화물</p>
              <p class="text-sm font-bold text-gray-800" style="font-family: 'Pretendard'">{{ Math.round(report.totalCarb) }}g</p>
            </div>
            <div class="bg-emerald-50 rounded-xl p-3 text-center">
              <p class="text-xs text-emerald-600 font-bold mb-1">단백질</p>
              <p class="text-sm font-bold text-gray-800" style="font-family: 'Pretendard'">{{ Math.round(report.totalProtein) }}g</p>
            </div>
            <div class="bg-orange-50 rounded-xl p-3 text-center">
              <p class="text-xs text-orange-600 font-bold mb-1">지방</p>
              <p class="text-sm font-bold text-gray-800" style="font-family: 'Pretendard'">{{ Math.round(report.totalFat) }}g</p>
            </div>
            <div class="bg-pink-50 rounded-xl p-3 text-center">
              <p class="text-xs text-pink-600 font-bold mb-1">당류</p>
              <p class="text-sm font-bold text-gray-800" style="font-family: 'Pretendard'">{{ Math.round(report.totalSugar || 0) }}g</p>
            </div>
            <div class="bg-indigo-50 rounded-xl p-3 text-center">
              <p class="text-xs text-indigo-600 font-bold mb-1">나트륨</p>
              <p class="text-sm font-bold text-gray-800" style="font-family: 'Pretendard'">{{ Math.round(report.totalNatrium || 0) }}g</p>
            </div>
          </div>

          <div class="flex items-center gap-4 text-gray-400 text-sm">
             <div class="flex items-center gap-1">
               <MessageCircle class="w-4 h-4"></MessageCircle>
               <span>분석 보기</span>
             </div>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-4 text-gray-400">
        불러오는 중...
      </div>
      <div v-if="!isLoading && reports.length === 0" class="text-center py-8 text-gray-400">
        공유된 레포트가 없습니다.
      </div>
    </main>
  </div>
</template>
