// API 통합 가이드 파일
// 이 파일은 각 컴포넌트에서 API를 어떻게 사용하는지 보여주는 예제입니다

/**
 * LoginPage.vue에서 로그인 API 사용 예제
 */
/*
import { useAuthStore } from '@/stores/auth'
import { showError } from '@/utils/errorHandler'

const authStore = useAuthStore()
const isLoading = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  errorMessage.value = ''
  isLoading.value = true
  
  try {
    await authStore.login({
      id: username.value,
      password: password.value
    })
    router.push('/')
  } catch (error) {
    errorMessage.value = showError(error, 'Login')
  } finally {
    isLoading.value = false
  }
}
*/

/**
 * SignupPage.vue에서 회원가입 API 사용 예제
 */
/*
import { authApi } from '@/api/auth.api'
import { emailApi } from '@/api/email.api'

// 아이디 중복 체크
const checkId = async () => {
  const exists = await authApi.checkIdDuplicate(formData.value.id)
  if (exists) {
    alert('이미 사용 중인 아이디입니다')
  }
}

// 이메일 인증 코드 발송
const sendCode = async () => {
  await emailApi.sendVerificationCode(formData.value.email)
  alert('인증 코드가 발송되었습니다')
}

// 회원가입
const signup = async () => {
  await authApi.signup(formData.value)
  router.push('/login')
}
*/

/**
 * FoodSearchPage.vue에서 음식 검색 API 사용 예제
 */
/*
import { foodApi } from '@/api/food.api'

const foodList = ref([])
const  currentPage = ref(1)
const keyword = ref('')

const searchFood = async () => {
  try {
    foodList.value = await foodApi.getFoodList(
      currentPage.value,
      keyword.value
    )
  } catch (error) {
    console.error(error)
  }
}
*/

/**
 * CharactersPage.vue에서 캐릭터 조회 API 사용 예제
 */
/*
import { characterApi } from '@/api/character.api'

const characters = ref([])

onMounted(async () => {
  try {
    characters.value = await characterApi.getAllCharacters()
  } catch (error) {
    console.error(error)
  }
})
*/

/**
 * My Page.vue에서 사용자 정보 조회/수정 API 사용 예제
 */
/*
import { userApi } from '@/api/user.api'

const userInfo = ref(null)

// 내 정보 조회
const loadUserInfo = async () => {
  userInfo.value = await userApi.getMyInfo()
}

// 내 정보 수정
const updateInfo = async () => {
  await userApi.updateMyInfo(formData.value)
  alert('정보가 수정되었습니다')
}

// 비밀번호 변경
const changePassword = async () => {
  await userApi.changePassword({
    oldPassword: oldPw.value,
    newPassword: newPw.value
  })
  alert('비밀번호가 변경되었습니다')
}
*/

/**
 * AnalyzePage.vue에서 음식 이미지 분석 API 사용 예제
 */
/*
import { foodApi } from '@/api/food.api'

const analyzeImage = async (file: File) => {
  try {
    const result = await foodApi.analyzeFood(file)
    console.log('AI 분석 결과:', result)
  } catch (error) {
    console.error(error)
  }
}
*/

/**
 * AnalysisResultPage.vue에서 레포트 생성 API 사용 예제
 */
/*
import { reportApi } from '@/api/report.api'

const createReport = async () => {
  try {
    await reportApi.createReport({
      meals: selectedMeals.value
    })
    alert('레포트가 생성되었습니다')
  } catch (error) {
    console.error(error)
  }
}
*/

/**
 * MealManagementPage.vue에서 찜 목록/레포트 조회 API 사용 예제
 */
/*
import { foodApi } from '@/api/food.api'
import { reportApi } from '@/api/report.api'

// 찜 목록 조회
const loadFavorites = async () => {
  favorites.value = await foodApi.getFavoriteList()
}

// 레포트 목록 조회
const loadReports = async () => {
  reports.value = await reportApi.getReportList()
}

// 레포트 삭제
const deleteReport = async (id: number) => {
  await reportApi.deleteReport(id)
  await loadReports()
}
*/

/**
 * AdminPage.vue에서 관리자 기능 API 사용 예제
 */
/*
import { adminApi } from '@/api/admin.api'

// 사용자 권한 수정
const updateRole = async (userId: string, role: string) => {
  await adminApi.updateUserRole({ userId, role })
}

// 음식 추가
const addFood = async () => {
  await adminApi.addFood(foodData.value)
}

// 대기중인 레포트 조회
const loadWaitingReports = async () => {
  const reports = await adminApi.getWaitingReports()
  return reports
}

// 레포트 작성 (점수, 캐릭터, 코멘트)
const completeReport = async () => {
  await adminApi.updateWaitingReport({
    id: reportId,
    score: 85,
    characterId: 1,
    comment: '균형잡힌 식단입니다!'
  })
}
*/

export { }
