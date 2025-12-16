import apiClient from './client'
import type {
    UserResponse,
    UserUpdateRequest,
    ChangePasswordRequest
} from './types'

/**
 * 사용자 정보 관련 API
 * 모두 인증 필요 (JWT 토큰)
 */
export const userApi = {
    /**
     * 내 정보 조회
     */
    async getMyInfo(): Promise<UserResponse> {
        const response = await apiClient.get<UserResponse>('/user')
        return response.data
    },

    /**
     * 내 정보 수정
     */
    async updateMyInfo(data: UserUpdateRequest): Promise<string> {
        const response = await apiClient.patch<string>('/user', data)
        return response.data
    },

    /**
     * 비밀번호 변경
     */
    async changePassword(data: ChangePasswordRequest): Promise<string> {
        const response = await apiClient.post<string>('/user/change-pw', data)
        return response.data
    },

    /**
     * 회원 탈퇴
     */
    async deleteAccount(): Promise<string> {
        const response = await apiClient.delete<string>('/user')
        return response.data
    }
}
