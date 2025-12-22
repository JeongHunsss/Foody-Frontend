// API Request & Response Types
// 백엔드 DTO와 일치하는 TypeScript 인터페이스 정의

// ============ User & Auth Types ============

export interface LoginRequest {
    id: string
    password: string
}

export interface LoginResponse {
    accessToken: string
    tokenType: string
    userId: string
    name: string
    role: string
}

export interface SignupRequest {
    id: string
    password: string
    name: string
    age: number
    email: string
    height: number
    weight: number
    gender: 'M' | 'F'
    activityLevel: number
    isDiabetes?: boolean
}

export interface UserResponse {
    id: string
    name: string
    age?: number
    email: string
    height: number
    weight: number
    gender: string
    activityLevel: number
    isDiabetes?: boolean
    role: string
    // 표준 영양정보 (StdInfo)
    stdWeight?: number
    stdKcal?: number
    stdCarb?: number
    stdProtein?: number
    stdFat?: number
    stdSugar?: number
    stdNatrium?: number
}

export interface UserUpdateRequest {
    name: string
    age?: number
    email: string
    height: number
    weight: number
    gender: 'M' | 'F'
    activityLevel: number
    isDiabetes?: boolean
}

export interface ChangePasswordRequest {
    oldPassword: string
    newPassword: string
}

// 아이디 찾기 - 인증번호 발송
export interface FindIdSendRequest {
    email: string
}

// 아이디 찾기 - 인증번호 검증
export interface FindIdVerifyRequest {
    email: string
    code: string
}

// 비밀번호 찾기 - 인증번호 발송
export interface FindPwSendRequest {
    id: string
    email: string
}

// 비밀번호 찾기 - 인증번호 검증 및 재설정
export interface FindPwVerifyRequest {
    id: string
    email: string
    code: string
}

export interface FindAccountRequest {
    email?: string
    id?: string
    code?: string
}

// ============ Food Types ============

export interface FoodResponse {
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

export interface AiFoodResponse {
    name: string
    standard: string
    kcal: number
    carb: number
    protein: number
    fat: number
    sugar: number
    natrium: number
}

export interface FavoriteRequest {
    foodCode?: string | null
    userFoodCode?: number | null
}

export interface FavoriteResponse {
    id: number
    userId: string
    foodCode: string
    userFoodCode?: string
    createdAt: string
    food?: FoodResponse
}

export interface FavoriteCodeResponse {
    favoriteId: number
    foodCode: string | null
    userFoodCode: number | null
}

// ============ Character Types ============

export interface CharacterResponse {
    id: number
    name: string
    img: string
    description: string
}

// ============ Report Types ============

export interface ReportFoodItem {
    foodCode?: string
    name: string
    eatenWeight: number
    standard?: number
    kcal: number
    carb: number
    protein: number
    fat: number
    sugar: number
    natrium: number
}

export interface ReportMealItem {
    mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
    foods: ReportFoodItem[]
}

export interface ReportRequest {
    isWaited: boolean
    meals: ReportMealItem[]
}
// 공통 페이지네이션 응답
export interface PageResponse<T> {
    content: T[]
    page: number
    size: number
    totalElements: number
    totalPages: number
}

// 레포트 API 관련
export interface ReportListResponse {
    id: number
    userId: string
    score?: number
    comment?: string
    characterId?: number
    isWaited?: boolean
    totalKcal?: number
    totalCarb?: number
    totalProtein?: number
    totalFat?: number
    totalSugar?: number
    totalNatrium?: number
    createdAt: string
}

export interface MealFoodResponse {
    id: number
    eatenWeight: number
    foodName: string
    foodCategory?: string
    userFoodName?: string
    eatenKcal: number
    eatenCarb: number
    eatenProtein: number
    eatenFat: number
    eatenSugar: number
    eatenNatrium: number
}

export interface MealResponse {
    id: number
    mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
    totalKcal: number
    totalCarb: number
    totalProtein: number
    totalFat: number
    totalSugar: number
    totalNatrium: number
    mealFoods: MealFoodResponse[]
}

export interface ReportResponse {
    id: number
    userId: string
    score: number
    comment: string
    characterId: number
    isWaited: boolean
    isShared: boolean
    expertId?: string
    expertName?: string

    // Daily totals
    totalKcal: number
    totalCarb: number
    totalProtein: number
    totalFat: number
    totalSugar: number
    totalNatrium: number

    // User info
    userAge: number
    userHeight: number
    userWeight: number
    userGender: string
    userActivityLevel: number
    userIsDiabetes: boolean

    // User standard
    userStdWeight: number
    userStdKcal: number
    userStdCarb: number
    userStdProtein: number
    userStdFat: number
    userStdSugar: number
    userStdNatrium: number

    createdAt: string
    meals: MealResponse[]
}

export interface ReportDetailResponse {
    reportId: number
    userId: string
    date: string
    score: number
    comment: string
    characterId: number
    characterName?: string
    totalKcal: number
    totalCarb: number
    totalProtein: number
    totalFat: number
}

export interface ReportComment {
    id: number
    reportId: number
    author: string
    comment: string
    createdAt: string
}

// ============ Admin Types ============

export interface UpdateRoleRequest {
    userId: string
    role: 'ROLE_USER' | 'ROLE_ADMIN'
}

export interface FoodRequest {
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

export interface ActivityLevelResponse {
    level: number
    value: number
    description: string
}

export interface UpdateActivityLevelRequest {
    level: number
    value: number
    description: string
}

export interface WaitingReportResponse {
    id: number
    userId: string
    userName: string
    createdAt: string
    totalKcal: number
    totalCarb: number
    totalProtein: number
    totalFat: number
    totalSugar: number
    totalNatrium: number
}

export interface UpdateWaitingReportRequest {
    id: number
    score: number
    characterId: number
    comment: string
}

// ============ Email Types ============

export interface EmailRequest {
    email: string
    code?: string
}

// ============ Common Types ============

export interface ApiError {
    message: string
    status: number
    timestamp?: string
}

export interface PaginationParams {
    page?: number
    size?: number
}
