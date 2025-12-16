import apiClient from './client'
import type { EmailRequest } from './types'

/**
 * 이메일 인증 관련 API
 */
export const emailApi = {
    /**
     * 이메일 인증 코드 발송
     */
    async sendVerificationCode(email: string): Promise<string> {
        const response = await apiClient.post<string>('/email/send', { email })
        return response.data
    },

    /**
     * 이메일 인증 코드 검증
     */
    async verifyCode(data: EmailRequest): Promise<string> {
        const response = await apiClient.post<string>('/email/verify', data)
        return response.data
    },

    /**
     * 이메일 중복 체크
     * @returns true: 중복, false: 사용 가능
     */
    async checkEmailDuplicate(email: string): Promise<boolean> {
        const response = await apiClient.get<boolean>('/email/check-email', {
            params: { email }
        })
        return response.data
    }
}
