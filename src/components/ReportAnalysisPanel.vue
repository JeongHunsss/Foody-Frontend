<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Save, X } from 'lucide-vue-next'
import { reportApi } from '@/api/report.api'
import { adminApi } from '@/api/admin.api'
import { characterApi } from '@/api/character.api'
import type { ReportResponse, CharacterResponse } from '@/api/types'

const props = defineProps<{
  reportId: number
}>()

const emit = defineEmits(['close', 'submitted'])

const reportDetail = ref<ReportResponse | null>(null)
const characters = ref<CharacterResponse[]>([])
const isLoading = ref(false)

// Form Data
const reportScore = ref<number | ''>('')
const reportCharacterId = ref<number | null>(null)
const reportComment = ref('')

const nutrientGauges = computed(() => {
    const d = reportDetail.value
    if (!d) return []
    return [
        { label: '칼로리', value: d.totalKcal, standard: d.userStdKcal, color: 'bg-emerald-500' },
        { label: '탄수화물', value: d.totalCarb, standard: d.userStdCarb, color: 'bg-blue-500' },
        { label: '단백질', value: d.totalProtein, standard: d.userStdProtein, color: 'bg-indigo-500' },
        { label: '지방', value: d.totalFat, standard: d.userStdFat, color: 'bg-yellow-500' },
        { label: '당류', value: d.totalSugar, standard: d.userStdSugar, color: 'bg-orange-500' },
        { label: '나트륨', value: d.totalNatrium, standard: d.userStdNatrium, color: 'bg-red-500' },
    ]
})

const loadData = async () => {
  if (!props.reportId) return
  isLoading.value = true
  try {
    const [detail, charList] = await Promise.all([
      reportApi.getReportDetail(props.reportId),
      characterApi.getAllCharacters()
    ])
    reportDetail.value = detail
    characters.value = charList

    if (!detail.isWaited) {
        reportScore.value = detail.score || ''
        reportCharacterId.value = detail.characterId || null
        reportComment.value = detail.comment || ''
    } else {
        reportScore.value = ''
        reportCharacterId.value = null
        reportComment.value = ''
    }

  } catch (error) {
    console.error('Failed to load report detail:', error)
    alert('레포트 정보를 불러오는데 실패했습니다.')
  } finally {
    isLoading.value = false
  }
}

const handleSubmitReport = async () => {
    if (!reportDetail.value) return
    
    // Validation
    if (reportScore.value === '' || !reportCharacterId.value || !reportComment.value) {
        alert('점수, 캐릭터, 코멘트를 모두 입력해주세요.')
        return
    }

    try {
        await adminApi.updateWaitingReport({
            id: props.reportId,
            score: Number(reportScore.value),
            characterId: reportCharacterId.value,
            comment: reportComment.value
        })
        alert('분석이 완료되었습니다.')
        emit('submitted')
    } catch (error: any) {
        console.error('Analysis submission failed:', error)
        alert('분석 제출 실패: ' + (error.response?.data?.message || error.message))
    }
}

watch(() => props.reportId, () => {
    loadData()
}, { immediate: true })

</script>

<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
        <h2 class="text-xl font-bold text-gray-900">레포트 상세 분석</h2>
        <button @click="$emit('close')" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X :size="24" />
        </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6 space-y-8">
        <div v-if="isLoading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>

        <div v-else-if="reportDetail" class="space-y-8">
            <!-- User Info -->
            <div class="bg-gray-50 p-6 rounded-2xl">
               <div class="flex justify-between items-center mb-4">
                 <h3 class="font-bold text-gray-800">사용자 정보</h3>
                 <span v-if="reportDetail.userIsDiabetes" class="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-bold">당뇨 환자</span>
               </div>
               <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                 <div><span class="text-gray-500">성별:</span> {{ reportDetail.userGender === 'M' ? '남성' : '여성' }}</div>
                 <div><span class="text-gray-500">나이:</span> {{ reportDetail.userAge }}세</div>
                 <div><span class="text-gray-500">신체:</span> {{ reportDetail.userHeight }}cm / {{ reportDetail.userWeight }}kg</div>
                 <div><span class="text-gray-500">활동:</span> {{ reportDetail.userActivityLevel }}</div>
               </div>
            </div>

            <div>
               <h3 class="font-bold text-gray-800 mb-4">영양 섭취 분석</h3>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div v-for="gauge in nutrientGauges" :key="gauge.label" class="space-y-2">
                       <div class="flex justify-between text-sm">
                           <span class="font-medium text-gray-700">{{ gauge.label }}</span>
                           <span class="text-gray-500">{{ gauge.value?.toFixed(1) }} / {{ gauge.standard?.toFixed(1) }}</span>
                       </div>
                       <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                           <div class="h-full rounded-full transition-all duration-500" 
                                :class="gauge.color" 
                                :style="{ width: Math.min((gauge.value / gauge.standard) * 100, 100) + '%' }">
                           </div>
                       </div>
                   </div>
               </div>
            </div>

            <div>
               <h3 class="font-bold text-gray-800 mb-4">식단 요약</h3>
               <div class="space-y-4">
                 <div v-for="meal in reportDetail.meals" :key="meal.id" class="border rounded-xl p-4">
                   <div class="flex justify-between items-center mb-2">
                     <span class="font-bold text-emerald-700">
                         {{ meal.mealType === 'BREAKFAST' ? '아침' : meal.mealType === 'LUNCH' ? '점심' : meal.mealType === 'DINNER' ? '저녁' : '간식' }}
                     </span>
                     <span class="text-sm text-gray-500">{{ meal.totalKcal?.toFixed(0) }} kcal</span>
                   </div>
                   <div class="flex flex-wrap gap-2">
                     <span v-for="food in meal.mealFoods" :key="food.id" class="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                       {{ food.foodName || food.userFoodName }} ({{ food.eatenWeight }}g)
                     </span>
                   </div>
                 </div>
               </div>
            </div>

             <hr class="border-gray-200" />

            <div class="space-y-6">
              <h3 class="font-bold text-gray-800">분석 내용 작성</h3>
              
              <div>
                <label class="block text-sm text-gray-700 mb-2">점수 (0-100)</label>
                <input v-model.number="reportScore" type="number" min="0" max="100" class="w-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none" />
              </div>

              <div>
                <label class="block text-sm text-gray-700 mb-2">캐릭터 선택</label>
                <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div v-for="char in characters" :key="char.id" @click="reportCharacterId = char.id"
                    :class="['p-2 rounded-xl border-2 cursor-pointer transition-all text-center', reportCharacterId === char.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300']">
                    <img :src="char.img" class="w-full h-24 object-contain mb-2" />
                    <p class="text-xs font-medium">{{ char.name }}</p>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm text-gray-700 mb-2">전문가 코멘트</label>
                <textarea v-model="reportComment" rows="6" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none resize-none"></textarea>
              </div>

              <button @click="handleSubmitReport" class="w-full py-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                <Save :size="24" />
                분석 완료 및 전송
              </button>
            </div>
        </div>
    </div>
  </div>
</template>
