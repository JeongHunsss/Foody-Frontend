import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth.api'
import { userApi } from '@/api/user.api'
import type { LoginRequest, UserResponse } from '@/api/types'

export interface User {
    id: string
    email: string
    name: string
    role: 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_GUEST'
    height?: number
    weight?: number
    gender?: string
    activityLevel?: number
    // StdInfo fields
    stdWeight?: number
    stdKcal?: number
    stdCarb?: number
    stdProtein?: number
    stdFat?: number
    stdSugar?: number
    stdNatrium?: number
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const token = ref<string | null>(null)

    const isLoggedIn = computed(() => !!token.value)
    const isAdmin = computed(() => user.value?.role === 'ROLE_ADMIN')
    const isGuest = computed(() => user.value?.role === 'ROLE_GUEST')

    /**
     * 로그인
     */
    async function login(credentials: LoginRequest) {
        const response = await authApi.login(credentials)

        // JWT 토큰 저장
        token.value = response.accessToken
        localStorage.setItem('token', response.accessToken)
        localStorage.setItem('isLoggedIn', 'true')

        // 사용자 정보 설정
        user.value = {
            id: response.userId,
            name: response.name,
            email: '', // 로그인 응답에는 이메일이 없으므로 별도 조회 필요
            role: response.role as 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_GUEST'
        }
        localStorage.setItem('userRole', response.role)

        // 전체 사용자 정보 로드
        await loadUserInfo()
    }

    /**
     * 로그아웃
     */
    async function logout() {
        try {
            await authApi.logout()
        } catch (error) {
            console.error('Logout API error:', error)
        } finally {
            // 로컬 상태 초기화
            user.value = null
            token.value = null
            localStorage.removeItem('isLoggedIn')
            localStorage.removeItem('userRole')
            localStorage.removeItem('token')
        }
    }

    /**
     * 사용자 정보 로드 (서버에서 최신 정보 가져오기)
     */
    async function loadUserInfo() {
        if (!token.value) return

        try {
            const userInfo: UserResponse = await userApi.getMyInfo()
            user.value = {
                id: userInfo.id,
                name: userInfo.name,
                email: userInfo.email,
                role: userInfo.role as 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_GUEST',
                height: userInfo.height,
                weight: userInfo.weight,
                gender: userInfo.gender,
                activityLevel: userInfo.activityLevel,
                // StdInfo 추가
                stdWeight: userInfo.stdWeight,
                stdKcal: userInfo.stdKcal,
                stdCarb: userInfo.stdCarb,
                stdProtein: userInfo.stdProtein,
                stdFat: userInfo.stdFat,
                stdSugar: userInfo.stdSugar,
                stdNatrium: userInfo.stdNatrium
            }
            console.log('User loaded with StdInfo:', user.value) // 디버깅용
        } catch (error) {
            console.error('Failed to load user info:', error)
            // 에러를 throw하여 호출자가 처리하도록 함
            throw error
        }
    }

    /**
     * 로컬 스토리지에서 인증 정보 복원
     * 토큰의 유효성을 검증한 후에만 로그인 상태로 복원
     */
    async function loadFromStorage() {
        const storedToken = localStorage.getItem('token')
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

        if (storedToken && isLoggedIn) {
            // 먼저 토큰을 설정 (API 요청에 필요)
            token.value = storedToken

            try {
                // 서버에 요청을 보내서 토큰 유효성 검증
                await loadUserInfo()
                // 성공하면 토큰이 유효함
            } catch (error) {
                // 토큰이 만료되었거나 유효하지 않음
                console.warn('Stored token is invalid or expired, clearing authentication state')
                // 상태 초기화
                user.value = null
                token.value = null
                localStorage.removeItem('token')
                localStorage.removeItem('isLoggedIn')
                localStorage.removeItem('userRole')
            }
        }
    }

    /**
     * 사용자 정보 업데이트 (프로필 수정 후)
     */
    function updateUser(updatedUser: Partial<User>) {
        if (user.value) {
            user.value = { ...user.value, ...updatedUser }
        }
    }

    return {
        user,
        token,
        isLoggedIn,
        isAdmin,
        isGuest,
        login,
        logout,
        loadUserInfo,
        loadFromStorage,
        updateUser
    }
})
