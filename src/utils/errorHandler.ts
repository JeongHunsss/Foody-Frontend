import axios, { AxiosError } from 'axios'
import type { ApiError } from '@/api/types'

/**
 * API 에러를 사용자 친화적인 메시지로 변환
 */
export function handleApiError(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiError>

        // 네트워크 에러
        if (!axiosError.response) {
            return '네트워크 연결을 확인해주세요.'
        }

        const status = axiosError.response.status
        const data = axiosError.response.data

        // 서버에서 보낸 에러 메시지 추출 (다양한 형태 지원)
        let message = ''

        // 1. data.message (가장 일반적)
        if (data?.message) {
            message = data.message
        }
        // 2. Validation 에러 Map 형태 { "fieldName": "error message", ... }
        else if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
            // message나 error 필드가 없고, 여러 필드-메시지 쌍이 있는 경우
            const entries = Object.entries(data)
            if (entries.length > 0) {
                // 모든 validation 에러를 합쳐서 표시 (필드명 없이 메시지만)
                const validationErrors = entries
                    .filter(([key]) => key !== 'message' && key !== 'error')
                    .map(([field, msg]) => msg)  // 필드명 제거, 메시지만 사용

                if (validationErrors.length > 0) {
                    message = validationErrors.join(', ')
                }
            }
        }
        // 3. data.error (일부 API)
        else if (!message && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
            message = data.error
        }
        // 4. data가 string인 경우
        else if (!message && typeof data === 'string') {
            message = data
        }

        // 서버 메시지가 있으면 사용
        if (message) {
            // 개발 환경에서는 상태 코드도 함께 표시
            if (import.meta.env.DEV) {
                console.log(`[API Error ${status}]:`, message)
            }
            return message
        }

        // HTTP 상태 코드별 기본 메시지
        switch (status) {
            case 400:
                return '잘못된 요청입니다.'
            case 401:
                return '로그인이 필요합니다.'
            case 403:
                return '접근 권한이 없습니다.'
            case 404:
                return '요청한 리소스를 찾을 수 없습니다.'
            case 409:
                return '중복된 데이터가 존재합니다.'
            case 500:
                return '서버 오류가 발생했습니다.'
            default:
                return `오류가 발생했습니다. (${status})`
        }
    }

    // Axios 외 에러
    if (error instanceof Error) {
        return error.message
    }

    return '알 수 없는 오류가 발생했습니다.'
}

/**
 * 에러를 콘솔에 로깅 (개발 환경)
 */
export function logError(error: unknown, context?: string): void {
    if (import.meta.env.DEV) {
        console.error(`[Error${context ? ` in ${context}` : ''}]:`, error)

        // Axios 에러인 경우 더 자세한 정보 로깅
        if (axios.isAxiosError(error)) {
            console.error('Response data:', error.response?.data)
            console.error('Status:', error.response?.status)
            console.error('Headers:', error.response?.headers)
        }
    }
}

/**
 * 에러 처리 및 사용자에게 알림
 */
export function showError(error: unknown, context?: string): string {
    logError(error, context)
    return handleApiError(error)
}

/**
 * 성공 메시지 추출 (서버 응답에서)
 */
export function extractSuccessMessage(response: any, defaultMessage: string = '성공했습니다'): string {
    if (response?.data?.message) {
        return response.data.message
    }
    if (typeof response?.data === 'string') {
        return response.data
    }
    return defaultMessage
}

