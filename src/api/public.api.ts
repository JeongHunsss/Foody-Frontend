import apiClient from './client'
import type { ActivityLevelResponse } from './types'

/**
 * Public API (인증 불필요)
 */
export const publicApi = {
    /**
     * 활동 레벨 전체 조회 (회원가입용)
     * 인증 없이 조회 가능
     */
    async getActivityLevels(): Promise<ActivityLevelResponse[]> {
        const response = await apiClient.get<ActivityLevelResponse[]>('/account/activitylevels')
        return response.data
    }
}
