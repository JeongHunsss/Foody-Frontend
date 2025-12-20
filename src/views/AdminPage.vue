<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  Shield, Users, Apple, Activity, FileText,
  Save, X, Plus, Trash2, Edit2, ChevronDown, ChevronUp, Search, Check, MessageCircle
} from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'
import { adminApi } from '@/api/admin.api'
import { foodApi } from '@/api/food.api'
import { chatApi, type ChatRoomResponse } from '@/api/chat.api'
import type { 
  FoodRequest, 
  ActivityLevelResponse, 
  WaitingReportResponse
} from '@/api/types'
import FoodSearchModal from '@/components/FoodSearchModal.vue'
import ChatModal from '@/components/ChatModal.vue'
import { useAuthStore } from '@/stores/auth'

// 권한 관리
const activeTab = ref<'role' | 'food' | 'activity' | 'report' | 'chat'>('report') // 기본 탭: 레포트
const targetUserId = ref('')
const targetRole = ref<'ROLE_USER' | 'ROLE_ADMIN'>('ROLE_USER')
const isUpdatingRole = ref(false)

// 음식 관리
const isAddingFood = ref(false)
const isRegisterOpen = ref(false)
const isDeleteOpen = ref(false)
const showSearchModal = ref(false)

const newFood = ref<FoodRequest>({
  code: '',
  name: '',
  category: '',
  standard: '',
  kcal: 0,
  carb: 0,
  protein: 0,
  fat: 0,
  sugar: 0,
  natrium: 0,
})

const categories = ref<string[]>([])

// 활동 레벨 관리
const activityLevels = ref<ActivityLevelResponse[]>([])
const editingLevel = ref<ActivityLevelResponse | null>(null)

import ReportAnalysisPanel from '@/components/ReportAnalysisPanel.vue'

// 레포트 관리
const waitingReports = ref<WaitingReportResponse[]>([]) // 대기 목록
const selectedReportId = ref<number | null>(null)


// 데이터 로드 함수들
const loadActivityLevels = async () => {
  try {
    activityLevels.value = await adminApi.getAllActivityLevels()
  } catch (error) {
    console.error('활동 레벨 로드 실패:', error)
  }
}

const loadWaitingReports = async () => {
  try {
    waitingReports.value = await adminApi.getWaitingReports()
  } catch (error) {
    console.error('대기 레포트 로드 실패:', error)
  }
}


const authStore = useAuthStore()
const chatRooms = ref<ChatRoomResponse[]>([])
const isChatModalOpen = ref(false)

const loadChatRooms = async () => {
    try {
        chatRooms.value = await chatApi.getExpertRooms()
    } catch (error) {
        console.error('채팅 목록 로드 실패:', error)
    }
}

onMounted(async () => {
  try {
    const [cats, levels, reports] = await Promise.all([
      foodApi.getCategories(),
      adminApi.getAllActivityLevels(),
      adminApi.getWaitingReports()
    ])
    categories.value = cats
    activityLevels.value = levels
    waitingReports.value = reports
    await loadChatRooms()
  } catch (error) {
    console.error('데이터 로드 실패:', error)
  }
})

// 권한 수정 핸들러
const handleUpdateRole = async () => {
  if (!targetUserId.value) {
    alert('사용자 ID를 입력해주세요.')
    return
  }
  
  if (isUpdatingRole.value) return
  
  try {
    isUpdatingRole.value = true
    await adminApi.updateUserRole({
      userId: targetUserId.value,
      role: targetRole.value
    })
    alert(`사용자 ${targetUserId.value}의 권한이 ${targetRole.value}로 변경되었습니다.`)
    targetUserId.value = ''
    targetRole.value = 'ROLE_USER'
  } catch (error: any) {
    console.error('권한 수정 실패 사유:', error)
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data || 
      error.message || 
      '알 수 없는 오류가 발생했습니다'
    alert(`권한 수정에 실패했습니다: ${errorMessage}`)
  } finally {
    isUpdatingRole.value = false
  }
}

// 음식 등록 핸들러
const handleAddFood = async () => {
  if (!newFood.value.code || !newFood.value.name) {
    alert('음식 코드와 이름은 필수입니다.')
    return
  }

  try {
    isAddingFood.value = true
    await adminApi.addFood(newFood.value)
    alert(`음식 ${newFood.value.name}이(가) 등록되었습니다.`)
    
    // 폼 초기화
    newFood.value = {
      code: '',
      name: '',
      category: '',
      standard: '',
      kcal: 0,
      carb: 0,
      protein: 0,
      fat: 0,
      sugar: 0,
      natrium: 0,
    }
  } catch (error: any) {
    console.error('음식 등록 실패:', error)
    let errorMessage = 
      error.response?.data?.message || 
      error.response?.data || 
      error.message || 
      '알 수 없는 오류가 발생했습니다'
    
    if (typeof errorMessage === 'object') {
      errorMessage = Object.values(errorMessage).join('\n')
    }

    alert(`음식 등록에 실패했습니다:\n${errorMessage}`)
  } finally {
    isAddingFood.value = false
  }
}

// 활동 레벨 수정 핸들러
const handleUpdateActivityLevel = async () => {
  if (!editingLevel.value) return
  
  try {
    await adminApi.updateActivityLevel({
      level: editingLevel.value.level,
      value: editingLevel.value.value,
      description: editingLevel.value.description
    })
    
    alert('활동 레벨이 수정되었습니다.')
    await loadActivityLevels() // 목록 새로고침
    editingLevel.value = null
  } catch (error: any) {
    console.error('활동 레벨 수정 실패:', error)
     const errorMessage = 
      error.response?.data?.message || 
      error.response?.data || 
      error.message || 
      '알 수 없는 오류가 발생했습니다'
    alert(`수정 실패: ${errorMessage}`)
  }
}

// 레포트 상세 보기 및 작성 모드 진입
const handleSelectReport = (reportId: number) => {
  selectedReportId.value = reportId
}



const closeReportDetail = () => {
  selectedReportId.value = null
}

const selectedChatRoom = ref<ChatRoomResponse | undefined>(undefined)

const openChat = (room: ChatRoomResponse) => {
    selectedChatRoom.value = room
    isChatModalOpen.value = true
}

const closeChat = () => {
    selectedChatRoom.value = undefined
    isChatModalOpen.value = false
    loadChatRooms() // 대화 후 목록 갱신 (선택 사항)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-green-50">
    <Navbar />

    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- 헤더 -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0 }"
        class="mb-8"
      >
        <div class="flex items-center gap-3 mb-2">
          <Shield :size="32" class="text-emerald-600" />
          <h1 class="text-gray-900">관리자 페이지</h1>
        </div>
        <p class="text-gray-600">시스템 관리 및 전문가 분석 작성</p>
      </div>

      <!-- 탭 네비게이션 -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0 }"
        class="bg-white rounded-2xl shadow-md p-2 mb-8 grid grid-cols-2 md:grid-cols-4 gap-2"
      >
        <button
          @click="activeTab = 'report'"
          :class="[
            'py-3 px-4 rounded-xl transition-all text-sm md:text-base',
            activeTab === 'report'
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
        >
          <FileText :size="20" class="inline-block mr-1 md:mr-2" />
          레포트 관리
        </button>
        <button
          @click="activeTab = 'role'"
          :class="[
            'py-3 px-4 rounded-xl transition-all text-sm md:text-base',
            activeTab === 'role'
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
        >
          <Users :size="20" class="inline-block mr-1 md:mr-2" />
          권한 관리
        </button>
        <button
          @click="activeTab = 'food'"
          :class="[
            'py-3 px-4 rounded-xl transition-all text-sm md:text-base',
            activeTab === 'food'
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
        >
          <Apple :size="20" class="inline-block mr-1 md:mr-2" />
          음식 관리
        </button>
        <button
          @click="activeTab = 'activity'"
          :class="[
            'py-3 px-4 rounded-xl transition-all text-sm md:text-base',
            activeTab === 'activity'
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
        >
          <Activity :size="20" class="inline-block mr-1 md:mr-2" />
          활동 레벨
        </button>
        <button
          @click="activeTab = 'chat'"
          :class="[
            'py-3 px-4 rounded-xl transition-all text-sm md:text-base',
            activeTab === 'chat'
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
        >
          <MessageCircle :size="20" class="inline-block mr-1 md:mr-2" />
          1:1 채팅
        </button>
      </div>

      <!-- 권한 관리 탭 -->
      <div
        v-if="activeTab === 'role'"
        v-motion
        :initial="{ opacity: 0, x: -20 }"
        :enter="{ opacity: 1, x: 0 }"
        class="bg-white rounded-3xl shadow-lg p-8 border-2 border-emerald-100"
      >
        <h2 class="text-gray-900 mb-6 flex items-center gap-2">
          <Users :size="24" class="text-emerald-600" />
          사용자 권한 수정
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-700 mb-2">사용자 ID</label>
            <input
              v-model="targetUserId"
              type="text"
              placeholder="권한을 변경할 사용자 ID"
              class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          <div>
            <label class="block text-sm text-gray-700 mb-2">권한</label>
            <select
              v-model="targetRole"
              class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors bg-white"
            >
              <option value="ROLE_USER">USER</option>
              <option value="ROLE_ADMIN">ADMIN</option>
            </select>
          </div>

          <button
            @click="handleUpdateRole"
            :disabled="isUpdatingRole"
            :class="[
              'w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2',
              isUpdatingRole ? 'opacity-50 cursor-not-allowed' : ''
            ]"
          >
            <Save :size="20" :class="{ 'animate-spin': isUpdatingRole }" />
            {{ isUpdatingRole ? '처리 중...' : '권한 변경' }}
          </button>
        </div>
      </div>

      <!-- 음식 관리 탭 -->
      <div
        v-if="activeTab === 'food'"
        v-motion
        :initial="{ opacity: 0, x: -20 }"
        :enter="{ opacity: 1, x: 0 }"
        class="space-y-6"
      >
        <!-- 음식 등록 -->
        <div class="bg-white rounded-3xl shadow-lg border-2 border-emerald-100 overflow-hidden transition-all duration-300">
          <button 
            @click="isRegisterOpen = !isRegisterOpen"
            class="w-full flex items-center justify-between p-8 hover:bg-emerald-50/50 transition-colors"
          >
            <h2 class="text-gray-900 flex items-center gap-2">
              <Plus :size="24" class="text-emerald-600" />
              음식 등록
            </h2>
            <component :is="isRegisterOpen ? ChevronUp : ChevronDown" :size="24" class="text-gray-400" />
          </button>

          <div v-show="isRegisterOpen" class="px-8 pb-8">
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-700 mb-2">음식 코드 *</label>
                <input
                  v-model="newFood.code"
                  type="text"
                  placeholder="예: F001"
                  class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <div>
                <label class="block text-sm text-gray-700 mb-2">음식명 *</label>
                <input
                  v-model="newFood.name"
                  type="text"
                  placeholder="예: 김치볶음밥"
                  class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <div>
                <label class="block text-sm text-gray-700 mb-2">카테고리</label>
                <select
                  v-model="newFood.category"
                  class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors bg-white"
                >
                  <option value="" disabled>선택하세요</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">
                    {{ cat }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm text-gray-700 mb-2">기준량</label>
                <input
                  v-model="newFood.standard"
                  type="text"
                  placeholder="예: 100g"
                  class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <div>
                <label class="block text-sm text-gray-700 mb-2">칼로리 (kcal)</label>
                <input
                  v-model.number="newFood.kcal"
                  type="number"
                  class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <div>
                <label class="block text-sm text-gray-700 mb-2">탄수화물 (g)</label>
                <input
                  v-model.number="newFood.carb"
                  type="number"
                  class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <div>
                <label class="block text-sm text-gray-700 mb-2">단백질 (g)</label>
                <input
                  v-model.number="newFood.protein"
                  type="number"
                  class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <div>
                <label class="block text-sm text-gray-700 mb-2">지방 (g)</label>
                <input
                  v-model.number="newFood.fat"
                  type="number"
                  class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <div>
                <label class="block text-sm text-gray-700 mb-2">당류 (g)</label>
                <input
                  v-model.number="newFood.sugar"
                  type="number"
                  class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <div>
                <label class="block text-sm text-gray-700 mb-2">나트륨 (g)</label>
                <input
                  v-model.number="newFood.natrium"
                  type="number"
                  class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>

            <button
              @click="handleAddFood"
              :disabled="isAddingFood"
              :class="[
                'w-full mt-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2',
                isAddingFood ? 'opacity-50 cursor-not-allowed' : ''
              ]"
            >
              <Plus :size="20" :class="{ 'animate-spin': isAddingFood && !newFood.code }" />
              {{ isAddingFood ? '등록 중...' : '음식 등록' }}
            </button>
          </div>
        </div>

        <!-- 음식 삭제 및 관리 -->
        <div class="bg-white rounded-3xl shadow-lg border-2 border-red-100 overflow-hidden transition-all duration-300">
          <button 
            @click="isDeleteOpen = !isDeleteOpen"
            class="w-full flex items-center justify-between p-8 hover:bg-red-50/50 transition-colors"
          >
            <h2 class="text-gray-900 flex items-center gap-2">
              <Trash2 :size="24" class="text-red-600" />
              음식 삭제 및 관리
            </h2>
            <component :is="isDeleteOpen ? ChevronUp : ChevronDown" :size="24" class="text-gray-400" />
          </button>

          <div v-show="isDeleteOpen" class="px-8 pb-8">
            <p class="text-gray-600 mb-4">음식을 검색하여 삭제하거나 관리할 수 있습니다.</p>
            <button
              @click="showSearchModal = true"
              class="w-full py-3 bg-white border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
            >
              <Search :size="20" />
              음식 검색 및 관리 메뉴 열기
            </button>
          </div>
        </div>
      </div>

      <!-- 음식 검색 모달 (삭제용) -->
      <FoodSearchModal
        :is-open="showSearchModal"
        meal-time="snack"
        @close="showSearchModal = false"
        @add-food="() => {}"
      />

      <!-- 활동 레벨 관리 탭 -->
      <div
        v-if="activeTab === 'activity'"
        v-motion
        :initial="{ opacity: 0, x: -20 }"
        :enter="{ opacity: 1, x: 0 }"
        class="bg-white rounded-3xl shadow-lg p-8 border-2 border-emerald-100"
      >
        <h2 class="text-gray-900 mb-6 flex items-center gap-2">
          <Activity :size="24" class="text-emerald-600" />
          활동 레벨 관리
        </h2>

        <div class="space-y-4">
          <div
            v-for="level in activityLevels"
            :key="level.level"
            class="p-6 border-2 border-gray-200 rounded-2xl hover:border-emerald-300 transition-colors"
          >
            <!-- 수정 모드 -->
            <div v-if="editingLevel?.level === level.level" class="space-y-4">
              <div class="grid md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm text-gray-700 mb-2">레벨</label>
                  <input
                    :value="editingLevel.level"
                    type="number"
                    disabled
                    class="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label class="block text-sm text-gray-700 mb-2">가중치</label>
                  <input
                    v-model.number="editingLevel.value"
                    type="number"
                    step="0.001"
                    class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
                <div>
                  <label class="block text-sm text-gray-700 mb-2">설명</label>
                  <input
                    v-model="editingLevel.description"
                    type="text"
                    class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="handleUpdateActivityLevel"
                  class="flex-1 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Save :size="16" />
                  저장
                </button>
                <button
                  @click="editingLevel = null"
                  class="flex-1 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <X :size="16" />
                  취소
                </button>
              </div>
            </div>

            <!-- 일반 모드 -->
            <div v-else class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-4 mb-2">
                  <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                    레벨 {{ level.level }}
                  </span>
                  <span class="text-gray-700">가중치: {{ level.value }}</span>
                </div>
                <p class="text-gray-600">{{ level.description }}</p>
              </div>
              <button
                @click="editingLevel = { ...level }"
                class="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <Edit2 :size="20" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 레포트 관리 탭 -->
      <!-- 레포트 관리 탭 -->
      <div
        v-if="activeTab === 'report'"
        v-motion
        :initial="{ opacity: 0, x: -20 }"
        :enter="{ opacity: 1, x: 0 }"
        class="space-y-6"
      >
        <div class="bg-white rounded-3xl shadow-lg p-8 border-2 border-emerald-100">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-gray-900 flex items-center gap-2">
              <FileText :size="24" class="text-emerald-600" />
              전문가 분석 대기 목록
            </h2>
            <div class="text-sm text-gray-600">
              총 {{ waitingReports.length }}건 대기 중
            </div>
          </div>

          <!-- 대기 중인 레포트 없음 -->
          <div v-if="waitingReports.length === 0" class="text-center py-12">
            <FileText :size="64" class="text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500">대기 중인 레포트가 없습니다.</p>
          </div>

          <!-- 대기 중인 레포트 목록 -->
          <div v-else class="space-y-4">
            <div
              v-for="report in waitingReports"
              :key="report.id"
              class="p-6 border-2 border-gray-200 rounded-2xl hover:border-emerald-300 transition-colors"
            >
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-gray-900 mb-1">
                    {{ report.userName }} ({{ report.userId }})
                  </h3>
                  <p class="text-sm text-gray-600">{{ report.createdAt }}</p>
                </div>
                <button
                  @click="handleSelectReport(report.id)"
                  class="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                >
                  분석 작성
                </button>
              </div>
              <div class="grid grid-cols-3 md:grid-cols-6 gap-4 text-sm">
                <div class="text-center p-3 bg-gray-50 rounded-xl">
                  <p class="text-gray-600 mb-1">칼로리</p>
                  <p class="text-gray-900">{{ report.totalKcal?.toFixed(1) }} kcal</p>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-xl">
                  <p class="text-gray-600 mb-1">탄수화물</p>
                  <p class="text-gray-900">{{ report.totalCarb?.toFixed(1) }} g</p>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-xl">
                  <p class="text-gray-600 mb-1">단백질</p>
                  <p class="text-gray-900">{{ report.totalProtein?.toFixed(1) }} g</p>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-xl">
                  <p class="text-gray-600 mb-1">지방</p>
                  <p class="text-gray-900">{{ report.totalFat?.toFixed(1) }} g</p>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-xl">
                  <p class="text-gray-600 mb-1">당류</p>
                  <p class="text-gray-900">{{ report.totalSugar?.toFixed(1) }} g</p>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-xl">
                  <p class="text-gray-600 mb-1">나트륨</p>
                  <p class="text-gray-900">{{ report.totalNatrium?.toFixed(1) }} g</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 레포트 작성 폼 (상세) -->
        <div v-if="selectedReportId" class="bg-white rounded-3xl shadow-lg border-2 border-blue-100 h-[800px] overflow-hidden">
             <ReportAnalysisPanel
                :report-id="selectedReportId"
                @close="closeReportDetail"
                @submitted="() => { loadWaitingReports(); closeReportDetail(); }"
             />
        </div>
      </div>

      <!-- 채팅 관리 탭 -->
      <div
        v-if="activeTab === 'chat'"
        v-motion
        :initial="{ opacity: 0, x: -20 }"
        :enter="{ opacity: 1, x: 0 }"
        class="bg-white rounded-3xl shadow-lg p-8 border-2 border-emerald-100"
      >
        <h2 class="text-gray-900 mb-6 flex items-center gap-2">
            <MessageCircle :size="24" class="text-emerald-600" />
            1:1 상담 채팅 목록
        </h2>

        <div v-if="chatRooms.length === 0" class="text-center py-12 text-gray-500">
            진행 중인 상담이 없습니다.
        </div>

        <div v-else class="space-y-4">
            <div
                v-for="room in chatRooms"
                :key="room.id"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer"
                @click="openChat(room)"
            >
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                        {{ room.userName.charAt(0) }}
                    </div>
                    <div>
                        <p class="font-bold text-gray-800">{{ room.userName }} ({{ room.userId }})</p>
                        <p class="text-sm text-gray-500">{{ new Date(room.createdAt).toLocaleString() }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 text-emerald-600">
                    <span class="text-sm font-medium">채팅하기</span>
                    <MessageCircle :size="16" />
                </div>
            </div>
        </div>
      </div>
      
      <!-- 채팅 모달 -->
      <ChatModal
        :is-open="isChatModalOpen"
        :room-id="selectedChatRoom?.id"
        :report-id="selectedChatRoom?.reportId"
        :partner-name="selectedChatRoom?.userName"
        :user-name="authStore.user?.name || 'Admin'"
        :user-id="authStore.user?.id || ''"
        @close="closeChat"

      />

    </div>
  </div>
</template>
