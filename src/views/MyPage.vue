<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  User, Mail, Weight, Activity, Calendar, Stethoscope,
  Edit2, Save, X, ChevronRight, FileText, ChevronLeft, Trash2, Lock, Eye, EyeOff
} from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'
import ssassakFoody from '@/assets/characters/ssassak_foody.png'
import { useAuthStore } from '@/stores/auth'
import { userApi } from '@/api/user.api'
import { reportApi } from '@/api/report.api'
import { publicApi } from '@/api/public.api'
import { characterApi } from '@/api/character.api'
import type { UserResponse, ReportListResponse, ActivityLevelResponse, CharacterResponse } from '@/api/types'
import { showError } from '@/utils/errorHandler'

const router = useRouter()
const authStore = useAuthStore()

// 사용자 데이터
const userData = ref<UserResponse | null>(null)
const editedData = ref<UserResponse | null>(null)
const reports = ref<ReportListResponse[]>([])
const activityLevels = ref<ActivityLevelResponse[]>([])
const characters = ref<CharacterResponse[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const activeTab = ref<'info' | 'reports'>('info')
const isEditing = ref(false)

// 비밀번호 변경
const isChangingPassword = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// 날짜 필터 및 페이지네이션
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)

// 활동량 설명 가져오기
const getActivityLevelDescription = (level: number) => {
  if (activityLevels.value.length === 0) return '로딩 중...'
  const found = activityLevels.value.find(l => l.level === level)
  return found ? found.description : ''
}

// 캐릭터 정보 가져오기
const getCharacterById = (characterId: number | null | undefined) => {
  if (!characterId) return null
  return characters.value.find(c => c.id === characterId) || null
}

// 사용자 정보 로드
const loadUserInfo = async () => {
  try {
    const data = await userApi.getMyInfo()
    userData.value = data
    editedData.value = { ...data }
  } catch (error) {
    errorMessage.value = showError(error)
  }
}

// 활동량 목록 로드
const loadActivityLevels = async () => {
  try {
    activityLevels.value = await publicApi.getActivityLevels()
  } catch (error) {
    console.error('Failed to load activity levels:', error)
  }
}

// 캐릭터 목록 로드
const loadCharacters = async () => {
  try {
    characters.value = await characterApi.getAllCharacters()
  } catch (error) {
    console.error('Failed to load characters:', error)
  }
}

// 레포트 로드
const loadReports = async () => {
  isLoading.value = true
  try {
    const response = await reportApi.getReportList(
      currentPage.value,
      startDate.value || undefined,
      endDate.value || undefined
    )
    // PageResponse 구조 분해
    reports.value = response.content
    totalPages.value = response.totalPages
  } catch (error: any) {
    // GUEST가 레포트 조회 시 발생하는 403 에러는 무시 (이미 Info 탭에서 경고를 보여주고 있음)
    if (error.response?.status === 403 && error.response?.data?.code === 'NEED_ADDITIONAL_INFO') {
      return
    }
    errorMessage.value = showError(error)
  } finally {
    isLoading.value = false
  }
}

// 클라이언트 사이드 필터링 Computed 제거 (서버에서 필터링됨)
const currentReports = computed(() => {
  return reports.value
})

const totalPages = ref(1) // 서버에서 받아올 총 페이지 수

const handlePageChange = async (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    await loadReports() // 페이지 변경 시 서버 요청
  }
}

const handleSearch = async () => {
  currentPage.value = 1
  await loadReports()
}

const handleResetFilter = async () => {
  startDate.value = ''
  endDate.value = ''
  currentPage.value = 1
  await loadReports()
}

const handleDeleteReport = async (reportId: number, e: Event) => {
  e.stopPropagation()
  
  if (window.confirm('이 레포트를 삭제하시겠습니까?')) {
    try {
      await reportApi.deleteReport(reportId)
      reports.value = reports.value.filter(report => report.id !== reportId)
      
      // 삭제 후 페이지 조정
      if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value
      }
    } catch (error) {
      errorMessage.value = showError(error)
    }
  }
}

const handleSave = async () => {
  if (!editedData.value) return
  
  try {
    await userApi.updateMyInfo({
      name: editedData.value.name,
      email: editedData.value.email,
      age: editedData.value.age,
      height: editedData.value.height,
      weight: editedData.value.weight,
      gender: editedData.value.gender as 'M' | 'F',
      activityLevel: editedData.value.activityLevel,
      isDiabetes: editedData.value.isDiabetes
    })
    // 서버에서 재계산된 권장 영양 정보를 받아오기 위해 다시 로드
    await loadUserInfo()
    isEditing.value = false
    alert('프로필이 업데이트되었습니다')
  } catch (error) {
    alert(showError(error))
  }
}

const handleCancel = () => {
  if (userData.value) {
    editedData.value = { ...userData.value }
  }
  isEditing.value = false
}

const handleDeleteAccount = async () => {
  if (window.confirm('정말로 회원탈퇴 하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
    if (window.confirm('모든 데이터가 삭제됩니다. 정말 탈퇴하시겠습니까?')) {
      try {
        await userApi.deleteAccount()
        authStore.logout()
        alert('회원탈퇴가 완료되었습니다.')
        router.push('/')
      } catch (error) {
        alert(showError(error))
      }
    }
  }
}

const handleChangePassword = async () => {
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    alert('모든 필드를 입력해주세요.')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    alert('새 비밀번호가 일치하지 않습니다.')
    return
  }
  if (newPassword.value.length < 8) {
    alert('비밀번호는 8자 이상이어야 합니다.')
    return
  }
  
  try {
    await userApi.changePassword({
      oldPassword: currentPassword.value,
      newPassword: newPassword.value
    })
    alert('비밀번호가 변경되었습니다.')
    isChangingPassword.value = false
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    alert(showError(error))
  }
}

onMounted(async () => {
  await Promise.all([loadUserInfo(), loadReports(), loadActivityLevels(), loadCharacters()])
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-green-50">
    <Navbar />

    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- 로딩 및 에러 메시지 -->
      <div v-if="isLoading && !userData" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p class="text-gray-600">정보를 불러오는 중입니다...</p>
      </div>

      <div v-if="errorMessage" class="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-center">
        {{ errorMessage }}
      </div>

      <!-- 탭 네비게이션 -->
      <div
        v-if="userData || activeTab === 'reports'"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0 }"
        class="bg-white rounded-2xl shadow-md p-2 mb-8 flex gap-2"
      >
        <button
          @click="activeTab = 'info'"
          :class="[
            'flex-1 py-3 px-6 rounded-xl transition-all',
            activeTab === 'info'
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
        >
          <User :size="20" class="inline-block mr-2" />
          내 정보
        </button>
        <button
          @click="activeTab = 'reports'"
          :class="[
            'flex-1 py-3 px-6 rounded-xl transition-all',
            activeTab === 'reports'
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
        >
          <FileText :size="20" class="inline-block mr-2" />
          분석 레포트
        </button>
      </div>

      <!-- 내 정보 탭 -->
      <div
        v-if="activeTab === 'info'"
        v-motion
        :initial="{ opacity: 0, x: -20 }"
        :enter="{ opacity: 1, x: 0 }"
        class="space-y-6"
      >
        <!-- 게스트 경고 배너 -->
        <div 
          v-if="authStore.user?.role === 'ROLE_GUEST'" 
          class="bg-amber-50 rounded-2xl p-6 border border-amber-200 flex items-center gap-4 shadow-sm"
        >
          <div class="bg-amber-100 p-3 rounded-full flex-shrink-0">
            <span class="text-2xl">⚠️</span>
          </div>
          <div>
            <h3 class="text-amber-800 font-bold text-lg mb-1">기본 정보 입력이 필요합니다</h3>
            <p class="text-amber-600">정확한 건강 분석을 위해 아래 사용자 정보를 모두 입력해주세요.</p>
          </div>
        </div>

        <!-- 권장 영양 정보 섹션 -->
      <div
        v-if="userData"
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
        class="bg-white rounded-2xl shadow-lg p-8 mb-8"
      >
        <h2 class="text-2xl text-gray-900 mb-6 flex items-center gap-2">
          <Activity :size="24" class="text-emerald-600" />
          나의 권장 영양 정보
        </h2>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
            <div class="text-sm text-gray-600 mb-1">칼로리</div>
            <div class="text-2xl text-orange-600 font-semibold">
              {{ (userData as any).stdKcal || 0 }}<span class="text-sm ml-1">kcal</span>
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
            <div class="text-sm text-gray-600 mb-1">탄수화물</div>
            <div class="text-2xl text-blue-600 font-semibold">
              {{ (userData as any).stdCarb || 0 }}<span class="text-sm ml-1">g</span>
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-4">
            <div class="text-sm text-gray-600 mb-1">단백질</div>
            <div class="text-2xl text-emerald-600 font-semibold">
              {{ (userData as any).stdProtein || 0 }}<span class="text-sm ml-1">g</span>
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
            <div class="text-sm text-gray-600 mb-1">지방</div>
            <div class="text-2xl text-yellow-600 font-semibold">
              {{ (userData as any).stdFat || 0 }}<span class="text-sm ml-1">g</span>
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4">
            <div class="text-sm text-gray-600 mb-1">당류</div>
            <div class="text-2xl text-pink-600 font-semibold">
              {{ (userData as any).stdSugar || 0 }}<span class="text-sm ml-1">g</span>
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
            <div class="text-sm text-gray-600 mb-1">나트륨</div>
            <div class="text-2xl text-purple-600 font-semibold">
              {{ (userData as any).stdNatrium || 0 }}<span class="text-sm ml-1">g</span>
            </div>
          </div>
        </div>
      </div>

        <template v-if="editedData">
        <!-- 프로필 카드 -->
        <div class="bg-white rounded-3xl shadow-lg p-8 border-2 border-emerald-100">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-gray-900 flex items-center gap-2">
              <User :size="24" class="text-emerald-600" />
              계정 정보
            </h2>
            <button
              v-if="!isEditing"
              @click="isEditing = true"
              class="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
            >
              <Edit2 :size="16" />
              수정
            </button>
            <div v-else class="flex gap-2">
              <button
                @click="handleSave"
                class="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
              >
                <Save :size="16" />
                저장
              </button>
              <button
                @click="handleCancel"
                class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X :size="16" />
                취소
              </button>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <!-- 아이디 -->
            <div class="space-y-2">
              <label class="text-sm text-gray-600 flex items-center gap-2">
                <User :size="16" />
                아이디
              </label>
              <input
                type="text"
                :value="editedData?.id"
                disabled
                class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700"
              />
            </div>

            <!-- 이름 -->
            <div class="space-y-2">
              <label class="text-sm text-gray-600 flex items-center gap-2">
                <User :size="16" />
                이름
              </label>
              <input
                v-model="editedData!.name"
                type="text"
                :disabled="!isEditing"
                :class="[
                  'w-full px-4 py-3 border-2 rounded-xl transition-colors',
                  isEditing
                    ? 'border-emerald-100 focus:border-emerald-400 focus:outline-none'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                ]"
              />
            </div>

            <!-- 나이 (신규) -->
            <div class="space-y-2">
              <label class="text-sm text-gray-600 flex items-center gap-2">
                <Calendar :size="16" />
                나이
              </label>
              <input
                v-model.number="editedData!.age"
                type="number"
                :disabled="!isEditing"
                placeholder="나이를 입력하세요"
                :class="[
                  'w-full px-4 py-3 border-2 rounded-xl transition-colors',
                  isEditing
                    ? 'border-emerald-100 focus:border-emerald-400 focus:outline-none'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                ]"
              />
            </div>

            <!-- 이메일 -->
            <div class="space-y-2">
              <label class="text-sm text-gray-600 flex items-center gap-2">
                <Mail :size="16" />
                이메일
              </label>
              <input
                v-model="editedData!.email"
                type="email"
                disabled
                class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700 cursor-not-allowed"
              />
            </div>

            <!-- 성별 (신규 추가, 기존에는 표시 안함? 아, 라디오버튼으로 추가 필요) -->
             <div class="space-y-2">
              <label class="text-sm text-gray-600 flex items-center gap-2">
                <User :size="16" />
                성별
              </label>
              <div class="flex gap-4 h-[52px] items-center px-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="M" v-model="editedData!.gender" :disabled="!isEditing" class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300" />
                  <span :class="!isEditing ? 'text-gray-500' : 'text-gray-700'">남성</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="F" v-model="editedData!.gender" :disabled="!isEditing" class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300" />
                  <span :class="!isEditing ? 'text-gray-500' : 'text-gray-700'">여성</span>
                </label>
              </div>
            </div>

            <!-- 키 -->
            <div class="space-y-2">
              <label class="text-sm text-gray-600 flex items-center gap-2">
                <Weight :size="16" />
                키
              </label>
              <div class="relative">
                <input
                  v-model.number="editedData!.height"
                  type="number"
                  :disabled="!isEditing"
                  :class="[
                    'w-full px-4 py-3 border-2 rounded-xl transition-colors',
                    isEditing
                      ? 'border-emerald-100 focus:border-emerald-400 focus:outline-none'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  ]"
                />
                <span class="absolute right-4 top-1/3 -translate-y-1/3 mt-0.5 text-gray-500">cm</span>
              </div>
            </div>

            <!-- 몸무게 -->
            <div class="space-y-2">
              <label class="text-sm text-gray-600 flex items-center gap-2">
                <Weight :size="16" />
                몸무게
              </label>
              <div class="relative">
                <input
                  v-model.number="editedData!.weight"
                  type="number"
                  :disabled="!isEditing"
                  :class="[
                    'w-full px-4 py-3 border-2 rounded-xl transition-colors',
                    isEditing
                      ? 'border-emerald-100 focus:border-emerald-400 focus:outline-none'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  ]"
                />
                <span class="absolute right-4 top-1/3 -translate-y-1/3 mt-0.5 text-gray-500">kg</span>
              </div>
            </div>
            
            <!-- 당뇨 여부 (신규) -->
             <div class="space-y-2">
              <label class="text-sm text-gray-600 flex items-center gap-2">
                <Stethoscope :size="16" />
                당뇨 여부
              </label>
              <div class="flex gap-4 h-[52px] items-center px-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" :value="true" v-model="editedData!.isDiabetes" :disabled="!isEditing" class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300" />
                  <span :class="!isEditing ? 'text-gray-500' : 'text-gray-700'">예</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" :value="false" v-model="editedData!.isDiabetes" :disabled="!isEditing" class="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300" />
                  <span :class="!isEditing ? 'text-gray-500' : 'text-gray-700'">아니오</span>
                </label>
              </div>
              <p v-if="editedData!.isDiabetes" class="text-xs text-amber-600 flex items-center gap-1 pl-2">
                <span>⚠️</span> 당뇨가 있는 경우 의사의 진단이 필요합니다
              </p>
            </div>

            <!-- 활동량 -->
            <div class="space-y-2 md:col-span-2">
              <label class="text-sm text-gray-600 flex items-center gap-2">
                <Activity :size="16" />
                활동량
              </label>
              <select
                v-if="isEditing"
                v-model.number="editedData!.activityLevel"
                class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors appearance-none bg-white cursor-pointer"
              >
                <option v-if="activityLevels.length === 0" :value="editedData?.activityLevel">데이터 로딩 중...</option>
                <option v-for="level in activityLevels" :key="level.level" :value="level.level">
                  {{ level.level }} - {{ level.description }}
                </option>
              </select>
              <input
                v-else
                type="text"
                :value="editedData?.activityLevel ? `${editedData.activityLevel} - ${getActivityLevelDescription(editedData.activityLevel)}` : ''"
                disabled
                class="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700"
              />
            </div>


          </div>
        </div>

        <!-- 비밀번호 변경 카드 -->
        <div class="bg-white rounded-3xl shadow-lg p-8 border-2 border-emerald-100">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-gray-900 flex items-center gap-2">
              <Lock :size="24" class="text-emerald-600" />
              비밀번호 변경
            </h2>
            <button
              v-if="!isChangingPassword"
              @click="isChangingPassword = true"
              class="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
            >
              변경하기
            </button>
          </div>

          <div v-if="isChangingPassword" class="space-y-4">
            <!-- 현재 비밀번호 -->
            <div class="space-y-2">
              <label class="text-sm text-gray-600">현재 비밀번호</label>
              <div class="relative">
                <input
                  v-model="currentPassword"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  placeholder="현재 비밀번호를 입력하세요"
                  class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors pr-12"
                />
                <button
                  type="button"
                  @click="showCurrentPassword = !showCurrentPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <EyeOff v-if="showCurrentPassword" :size="20" />
                  <Eye v-else :size="20" />
                </button>
              </div>
            </div>

            <!-- 새 비밀번호 -->
            <div class="space-y-2">
              <label class="text-sm text-gray-600">새 비밀번호</label>
              <div class="relative">
                <input
                  v-model="newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  placeholder="새 비밀번호를 입력하세요"
                  class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors pr-12"
                />
                <button
                  type="button"
                  @click="showNewPassword = !showNewPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <EyeOff v-if="showNewPassword" :size="20" />
                  <Eye v-else :size="20" />
                </button>
              </div>
            </div>

            <!-- 새 비밀번호 확인 -->
            <div class="space-y-2">
              <label class="text-sm text-gray-600">새 비밀번호 확인</label>
              <div class="relative">
                <input
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="새 비밀번호를 다시 입력하세요"
                  class="w-full px-4 py-3 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors pr-12"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <EyeOff v-if="showConfirmPassword" :size="20" />
                  <Eye v-else :size="20" />
                </button>
              </div>
            </div>

            <!-- 버튼 -->
            <div class="flex gap-3 pt-4">
              <button
                @click="() => {
                  isChangingPassword = false
                  currentPassword = ''
                  newPassword = ''
                  confirmPassword = ''
                }"
                class="flex-1 px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                @click="handleChangePassword"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                변경하기
              </button>
            </div>
          </div>
          <p v-else class="text-gray-600">비밀번호를 안전하게 관리하세요.</p>
        </div>

        <!-- 회원탈퇴 버튼 -->
        <button
          @click="handleDeleteAccount"
          class="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors border-2 border-red-200"
        >
          <User :size="20" />
          회원탈퇴
        </button>
        </template>
      </div>

      <!-- 분석 레포트 탭 -->
      <div
        v-if="activeTab === 'reports'"
        v-motion
        :initial="{ opacity: 0, x: -20 }"
        :enter="{ opacity: 1, x: 0 }"
        class="bg-white rounded-3xl shadow-lg p-8"
      >
        <h2 class="text-gray-900 flex items-center gap-2 mb-6">
          <FileText :size="24" class="text-emerald-600" />
          영양 분석 레포트
        </h2>

        <div class="space-y-4">
          <!-- 필터링 및 페이지네이션 -->
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
            <div class="flex flex-wrap items-center gap-2">
              <label class="text-sm text-gray-600">기간 필터링:</label>
              <input
                v-model="startDate"
                type="date"
                class="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
              />
              <span class="text-gray-500">~</span>
              <input
                v-model="endDate"
                type="date"
                class="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 transition-colors"
              />
              <button
                @click="handleSearch"
                class="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
              >
                조회
              </button>
              <button
                @click="handleResetFilter"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                초기화
              </button>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">페이지:</span>
              <button
                @click="handlePageChange(currentPage - 1)"
                :disabled="currentPage === 1"
                :class="[
                  'px-4 py-2 bg-gray-100 text-gray-700 rounded-xl transition-colors',
                  currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
                ]"
              >
                <ChevronLeft :size="16" />
              </button>
              <span class="text-sm text-gray-700">
                {{ currentPage }} / {{ totalPages }}
              </span>
              <button
                @click="handlePageChange(currentPage + 1)"
                :disabled="currentPage === totalPages"
                :class="[
                  'px-4 py-2 bg-gray-100 text-gray-700 rounded-xl transition-colors',
                  currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
                ]"
              >
                <ChevronRight :size="16" />
              </button>
            </div>
          </div>

          <!-- 레포트 목록 -->
          <div
            v-for="report in currentReports"
            :key="report.id"
            v-motion
            :hovered="{ scale: 1.01 }"
            @click="router.push(`/analyze/result/${report.id}`)"
            class="border-2 border-gray-200 rounded-2xl p-6 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer relative group bg-gradient-to-br from-white to-gray-50"
          >
            <!-- 삭제 버튼 -->
            <button
              @click="(e) => handleDeleteReport(report.id, e)"
              class="absolute top-4 right-4 p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100 z-10"
              aria-label="레포트 삭제"
            >
              <Trash2 :size="20" />
            </button>

            <div class="flex items-start justify-between gap-6">
              <!-- 우측 상단: 날짜 -->
              <div class="absolute top-6 right-16 text-sm text-gray-500">
                {{ new Date(report.createdAt).toLocaleDateString() }}
              </div>

              <!-- 좌측: 정보 영역 -->
              <div class="flex-1 space-y-4">
                <!-- 상단: 캐릭터와 점수 -->
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center flex-shrink-0 shadow-md">
                    <img 
                      :src="getCharacterById(report.characterId)?.img || ssassakFoody" 
                      :alt="getCharacterById(report.characterId)?.name || '새싹 푸디'"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="flex items-baseline gap-2">
                    <div class="text-5xl font-black text-emerald-600">{{ report.score }}</div>
                    <div class="text-lg text-gray-400 font-medium">점</div>
                  </div>
                  <span v-if="report.isWaited" class="ml-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold shadow-sm self-center">
                    분석 대기 중
                  </span>
                </div>
                
                <!-- 영양소 정보 -->
                <div class="grid grid-cols-3 gap-2">
                  <div class="bg-white border border-gray-200 p-3 rounded-xl text-center hover:border-orange-300 transition-colors">
                    <div class="text-xs text-gray-500 mb-1">칼로리</div>
                    <div class="text-sm font-bold text-orange-600">{{ report.totalKcal || 0 }}</div>
                    <div class="text-xs text-gray-400">kcal</div>
                  </div>
                  <div class="bg-white border border-gray-200 p-3 rounded-xl text-center hover:border-blue-300 transition-colors">
                    <div class="text-xs text-gray-500 mb-1">탄수화물</div>
                    <div class="text-sm font-bold text-blue-600">{{ report.totalCarb || 0 }}</div>
                    <div class="text-xs text-gray-400">g</div>
                  </div>
                  <div class="bg-white border border-gray-200 p-3 rounded-xl text-center hover:border-emerald-300 transition-colors">
                    <div class="text-xs text-gray-500 mb-1">단백질</div>
                    <div class="text-sm font-bold text-emerald-600">{{ report.totalProtein || 0 }}</div>
                    <div class="text-xs text-gray-400">g</div>
                  </div>
                  <div class="bg-white border border-gray-200 p-3 rounded-xl text-center hover:border-yellow-300 transition-colors">
                    <div class="text-xs text-gray-500 mb-1">지방</div>
                    <div class="text-sm font-bold text-yellow-600">{{ report.totalFat || 0 }}</div>
                    <div class="text-xs text-gray-400">g</div>
                  </div>
                  <div class="bg-white border border-gray-200 p-3 rounded-xl text-center hover:border-pink-300 transition-colors">
                    <div class="text-xs text-gray-500 mb-1">당류</div>
                    <div class="text-sm font-bold text-pink-600">{{ report.totalSugar || 0 }}</div>
                    <div class="text-xs text-gray-400">g</div>
                  </div>
                  <div class="bg-white border border-gray-200 p-3 rounded-xl text-center hover:border-purple-300 transition-colors">
                    <div class="text-xs text-gray-500 mb-1">나트륨</div>
                    <div class="text-sm font-bold text-purple-600">{{ report.totalNatrium || 0 }}</div>
                    <div class="text-xs text-gray-400">mg</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 빈 상태 -->
          <div v-if="currentReports.length === 0" class="text-center py-12">
            <FileText :size="64" class="text-gray-300 mx-auto mb-4" />
            <p class="text-gray-500 mb-2">{{ (startDate || endDate) ? '검색 결과가 없습니다.' : '레포트가 없습니다.' }}</p>
            <button
              v-if="(startDate || endDate)"
              @click="handleResetFilter"
              class="mt-4 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              필터 초기화
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
