<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { reportApi } from '@/api/report.api'
import type { ReportResponse } from '@/api/types'
import { MessageCircle } from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'

const router = useRouter()
  const reports = ref<ReportResponse[]>([])
  const isLoading = ref(false)
  const page = ref(1)
  const hasNextPage = ref(true)

  const fetchSharedReports = async () => {
    if (isLoading.value || !hasNextPage.value) return
    
    isLoading.value = true
    try {
      const response = await reportApi.getSharedReportList(page.value)
      if (page.value === 1) {
        reports.value = response.content
      } else {
        reports.value.push(...response.content)
      }
      
      hasNextPage.value = page.value < response.totalPages
      page.value++
    } catch (error) {
      console.error('Failed to fetch community feed', error)
    } finally {
      isLoading.value = false
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Infinite scroll handler (simple version)
  const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 100) {
      fetchSharedReports()
    }
  }

  onMounted(() => {
    fetchSharedReports()
  })
</script>

<template>
  <div class="h-full bg-gray-50 flex flex-col overflow-hidden">
    <!-- Navbar -->
    <Navbar></Navbar>

    <!-- Content -->
    <main 
      class="flex-1 overflow-y-auto p-4 space-y-4 pb-20"
      @scroll="handleScroll"
    >
      <div class="max-w-xl mx-auto space-y-4">
        <h1 class="text-2xl font-bold text-gray-900 px-2 py-4">식단 커뮤니티</h1>
        
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
              {{ report.score }}점
            </div>
          </div>

          <!-- Nutrient Summary -->
          <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
            <div class="bg-purple-50 rounded-xl p-3 text-center">
              <p class="text-xs text-purple-600 font-bold mb-1">칼로리</p>
              <p class="text-sm font-bold text-gray-800">{{ Math.round(report.totalKcal) }}</p>
            </div>
            <div class="bg-blue-50 rounded-xl p-3 text-center">
              <p class="text-xs text-blue-600 font-bold mb-1">탄수화물</p>
              <p class="text-sm font-bold text-gray-800">{{ Math.round(report.totalCarb) }}g</p>
            </div>
            <div class="bg-emerald-50 rounded-xl p-3 text-center">
              <p class="text-xs text-emerald-600 font-bold mb-1">단백질</p>
              <p class="text-sm font-bold text-gray-800">{{ Math.round(report.totalProtein) }}g</p>
            </div>
            <div class="bg-orange-50 rounded-xl p-3 text-center">
              <p class="text-xs text-orange-600 font-bold mb-1">지방</p>
              <p class="text-sm font-bold text-gray-800">{{ Math.round(report.totalFat) }}g</p>
            </div>
            <div class="bg-pink-50 rounded-xl p-3 text-center">
              <p class="text-xs text-pink-600 font-bold mb-1">당류</p>
              <p class="text-sm font-bold text-gray-800">{{ Math.round(report.totalSugar || 0) }}g</p>
            </div>
            <div class="bg-indigo-50 rounded-xl p-3 text-center">
              <p class="text-xs text-indigo-600 font-bold mb-1">나트륨</p>
              <p class="text-sm font-bold text-gray-800">{{ Math.round(report.totalNatrium || 0) }}g</p>
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
