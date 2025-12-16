import apiClient from './client'
import type {
    UpdateRoleRequest,
    FoodRequest,
    ActivityLevelResponse,
    UpdateActivityLevelRequest,
    WaitingReportResponse,
    UpdateWaitingReportRequest
} from './types'

/**
 * 관리자 전용 API
 * 모두 ADMIN 권한 필요
 */
export const adminApi = {
    /**
     * 사용자 권한 수정
     */
    async updateUserRole(data: UpdateRoleRequest): Promise<string> {
        const response = await apiClient.patch<string>('/admin', data)
        return response.data
    },

    /**
     * 음식 추가
     */
    async addFood(data: FoodRequest): Promise<string> {
        const response = await apiClient.post<string>('/admin', data)
        return response.data
    },

    /**
     * 음식 삭제
     */
    async deleteFood(code: string): Promise<string> {
        const response = await apiClient.delete<string>(`/admin/${code}`)
        return response.data
    },

    /**
     * 활동 레벨 전체 조회
     */
    async getAllActivityLevels(): Promise<ActivityLevelResponse[]> {
        const response = await apiClient.get<ActivityLevelResponse[]>('/admin/activitylevel')
        return response.data
    },

    /**
     * 활동 레벨 수정
     */
    async updateActivityLevel(data: UpdateActivityLevelRequest): Promise<string> {
        const response = await apiClient.patch<string>('/admin/activitylevel', data)
        return response.data
    },

    /**
     * 대기중인 레포트 목록 조회
     * @param page 페이지 번호 (기본값: 1)
     */
    async getWaitingReports(page: number = 1): Promise<WaitingReportResponse[]> {
        const response = await apiClient.get<WaitingReportResponse[]>('/admin/report', {
            params: { page }
        })
        return response.data
    },

    /**
     * 대기중인 레포트 작성 (점수, 캐릭터, 코멘트 추가)
     */
    async updateWaitingReport(data: UpdateWaitingReportRequest): Promise<string> {
        const response = await apiClient.patch<string>('/admin/report', data)
        return response.data
    }
}
