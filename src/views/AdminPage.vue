<script setup lang="ts">
import { ref } from 'vue'
import { 
  Shield, Users, Apple, Activity, FileText,
  Save, X, Plus, Trash2, Edit2
} from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'
import { adminApi } from '@/api/admin.api'

interface ActivityLevel {
  level: number
  value: number
  description: string
}

interface WaitingReport {
  id: number
  userId: string
  userName: string
  createdAt: string
  totalCalories: number
  carbs: number
  protein: number
  fat: number
}

interface Food {
  code: string
  name: string
  category: string
  standard: string
  kcal: number
  carb: number
  protein: number
  fat: number
  sugar: number
  natrium: number
}

// Mock 데이터
const mockActivityLevels: ActivityLevel[] = [
  { level: 1, value: 1.2, description: '거의 활동 없음 (주로 앉아서 생활)' },
  { level: 2, value: 1.375, description: '가벼운 활동 (주 1-2회 운동)' },
  { level: 3, value: 1.55, description: '보통 활동 (주 3-4회 운동)' },
  { level: 4, value: 1.725, description: '활발한 활동 (주 5-6회 운동)' },
  { level: 5, value: 1.9, description: '매우 활발함 (매일 격한 운동)' },
]

const mockWaitingReports: WaitingReport[] = [
  {
    id: 1,
    userId: 'user123',
    userName: '김푸디',
    createdAt: '2024-12-15',
    totalCalories: 1850,
    carbs: 200,
    protein: 80,
    fat: 50,
  },
  {
    id: 2,
    userId: 'user456',
    userName: '이푸디',
    createdAt: '2024-12-14',
    totalCalories: 2100,
    carbs: 250,
    protein: 90,
    fat: 60,
  },
]

const activeTab = ref<'role' | 'food' | 'activity' | 'report'>('report')

// 권한 관리
const targetUserId = ref('')
const targetRole = ref<'ROLE_USER' | 'ROLE_ADMIN'>('ROLE_USER')
const isUpdatingRole = ref(false)

// 음식 관리
const newFood = ref<Food>({
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
const deleteCode = ref('')

// 활동 레벨 관리
const activityLevels = ref<ActivityLevel[]>([...mockActivityLevels])
const editingLevel = ref<ActivityLevel | null>(null)

// 레포트 관리
const waitingReports = ref<WaitingReport[]>([...mockWaitingReports])
const selectedReport = ref<WaitingReport | null>(null)
const reportScore = ref('')
const reportCharacterId = ref('1')
const reportComment = ref('')

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
    // 서버에서 보내는 에러 메시지 추출
    const errorMessage = 
      error.response?.data?.message ||  // Spring Boot 기본 형식
      error.response?.data ||            // 문자열로 직접 반환된 경우
      error.message ||                   // axios 에러 메시지
      '알 수 없는 오류가 발생했습니다'
    alert(`권한 수정에 실패했습니다: ${errorMessage}`)
  } finally {
    isUpdatingRole.value = false
  }
}

// 음식 등록 핸들러
const handleAddFood = () => {
  if (!newFood.value.code || !newFood.value.name) {
    alert('음식 코드와 이름은 필수입니다.')
    return
  }
  alert(`음식 ${newFood.value.name}이(가) 등록되었습니다.`)
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
}

// 음식 삭제 핸들러
const handleDeleteFood = () => {
  if (!deleteCode.value) {
    alert('삭제할 음식 코드를 입력해주세요.')
    return
  }
  if (!window.confirm(`음식 코드 ${deleteCode.value}를 삭제하시겠습니까?`)) {
    return
  }
  alert(`음식 코드 ${deleteCode.value}가 삭제되었습니다.`)
  deleteCode.value = ''
}

// 활동 레벨 수정 핸들러
const handleUpdateActivityLevel = () => {
  if (!editingLevel.value) return
  
  activityLevels.value = activityLevels.value.map((al) =>
    al.level === editingLevel.value!.level ? editingLevel.value! : al
  )
  alert('활동 레벨이 수정되었습니다.')
  editingLevel.value = null
}

// 레포트 작성 핸들러
const handleSubmitReport = () => {
  if (!selectedReport.value) return
  if (!reportScore.value || !reportComment.value) {
    alert('점수와 코멘트를 입력해주세요.')
    return
  }
  alert('레포트가 작성되었습니다.')
  waitingReports.value = waitingReports.value.filter((r) => r.id !== selectedReport.value!.id)
  selectedReport.value = null
  reportScore.value = ''
  reportCharacterId.value = '1'
  reportComment.value = ''
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
        <div class="bg-white rounded-3xl shadow-lg p-8 border-2 border-emerald-100">
          <h2 class="text-gray-900 mb-6 flex items-center gap-2">
            <Plus :size="24" class="text-emerald-600" />
            음식 등록
          </h2>

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
              <input
                v-model="newFood.category"
                type="text"
                placeholder="예: 한식"
                class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
              />
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
              <label class="block text-sm text-gray-700 mb-2">나트륨 (mg)</label>
              <input
                v-model.number="newFood.natrium"
                type="number"
                class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          <button
            @click="handleAddFood"
            class="w-full mt-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Plus :size="20" />
            음식 등록
          </button>
        </div>

        <!-- 음식 삭제 -->
        <div class="bg-white rounded-3xl shadow-lg p-8 border-2 border-red-100">
          <h2 class="text-gray-900 mb-6 flex items-center gap-2">
            <Trash2 :size="24" class="text-red-600" />
            음식 삭제
          </h2>

          <div class="flex gap-4">
            <input
              v-model="deleteCode"
              type="text"
              placeholder="삭제할 음식 코드를 입력하세요"
              class="flex-1 px-4 py-3 border-2 border-red-100 rounded-xl focus:outline-none focus:border-red-400 transition-colors"
            />
            <button
              @click="handleDeleteFood"
              class="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <Trash2 :size="20" />
              삭제
            </button>
          </div>
        </div>
      </div>

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
                  @click="selectedReport = report"
                  class="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                >
                  분석 작성
                </button>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div class="text-center p-3 bg-gray-50 rounded-xl">
                  <p class="text-gray-600 mb-1">칼로리</p>
                  <p class="text-gray-900">{{ report.totalCalories }} kcal</p>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-xl">
                  <p class="text-gray-600 mb-1">탄수화물</p>
                  <p class="text-gray-900">{{ report.carbs }} g</p>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-xl">
                  <p class="text-gray-600 mb-1">단백질</p>
                  <p class="text-gray-900">{{ report.protein }} g</p>
                </div>
                <div class="text-center p-3 bg-gray-50 rounded-xl">
                  <p class="text-gray-600 mb-1">지방</p>
                  <p class="text-gray-900">{{ report.fat }} g</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 레포트 작성 폼 -->
        <div v-if="selectedReport" class="bg-white rounded-3xl shadow-lg p-8 border-2 border-blue-100">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-gray-900 flex items-center gap-2">
              <Edit2 :size="24" class="text-blue-600" />
              레포트 작성 - {{ selectedReport.userName }}
            </h2>
            <button
              @click="() => {
                selectedReport = null
                reportScore = ''
                reportCharacterId = '1'
                reportComment = ''
              }"
              class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="space-y-4">
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-700 mb-2">점수 *</label>
                <input
                  v-model="reportScore"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100 사이의 점수"
                  class="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-700 mb-2">캐릭터 ID</label>
                <select
                  v-model="reportCharacterId"
                  class="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 transition-colors bg-white"
                >
                  <option v-for="id in 10" :key="id" :value="id">캐릭터 {{ id }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm text-gray-700 mb-2">전문가 코멘트 *</label>
              <textarea
                v-model="reportComment"
                placeholder="전문가의 상세한 피드백을 작성하세요..."
                rows="6"
                class="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 transition-colors resize-none"
              ></textarea>
            </div>

            <button
              @click="handleSubmitReport"
              class="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Save :size="20" />
              레포트 제출
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
