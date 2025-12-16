import apiClient from './client'
import type {
    LoginRequest,
    LoginResponse,
    SignupRequest,
    FindAccountRequest
} from './types'

/**
 * 인증 관련 API
 */
export const authApi = {
    /**
     * 회원가입
     */
    async signup(data: SignupRequest): Promise<string> {
        const response = await apiClient.post<string>('/account/signup', data)
        return response.data
    },

    /**
     * 로그인
     */
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await apiClient.post<LoginResponse>('/account/login', data)
        return response.data
    },

    /**
     * 로그아웃
     */
    async logout(): Promise<string> {
        const response = await apiClient.post<string>('/account/logout')
        return response.data
    },

    /**
     * 아이디 중복 체크
     * @returns true: 중복, false: 사용 가능
     */
    async checkIdDuplicate(id: string): Promise<boolean> {
        const response = await apiClient.get<boolean>('/account/check-id', {
            params: { id }
        })
        return response.data
    },

    /**
     * 아이디 찾기 - 인증번호 발송
     */
    async sendCodeForFindId(email: string): Promise<string> {
        const response = await apiClient.post<string>('/account/find-id/send', { email })
        return response.data
    },

    /**
     * 아이디 찾기 - 인증번호 검증 및 아이디 반환
     */
    async verifyAndGetId(data: FindAccountRequest): Promise<string> {
        const response = await apiClient.post<string>('/account/find-id/verify', data)
        return response.data
    },

    /**
     * 비밀번호 찾기 - 인증번호 발송
     */
    async sendCodeForFindPassword(id: string, email: string): Promise<string> {
        const response = await apiClient.post<string>('/account/find-pw/send', { id, email })
        return response.data
    },

    /**
     * 비밀번호 찾기 - 인증번호 검증 및 임시 비밀번호 발급
     */
    async resetPassword(data: FindAccountRequest): Promise<string> {
        const response = await apiClient.post<string>('/account/find-pw/verify', data)
        return response.data
    }
}
