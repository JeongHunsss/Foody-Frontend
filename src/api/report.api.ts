import apiClient from './client'
import type { Report, ReportRequest } from './types'

/**
 * 레포트 관련 API
 * 모두 인증 필요 (JWT 토큰)
 */
export const reportApi = {
    /**
     * 레포트 생성
     */
    async createReport(data: ReportRequest): Promise<string> {
        const response = await apiClient.post<string>('/report', data)
        return response.data
    },

    /**
     * 레포트 목록 조회
     * @param page 페이지 번호 (기본값: 1)
     * @param startDate 시작 날짜 (optional, YYYY-MM-DD)
     * @param endDate 종료 날짜 (optional, YYYY-MM-DD)
     */
    async getReportList(
        page: number = 1,
        startDate?: string,
        endDate?: string
    ): Promise<Report[]> {
        const response = await apiClient.get<Report[]>('/report', {
            params: { page, startDate, endDate }
        })
        return response.data
    },

    /**
     * 레포트 상세 조회
     */
    async getReportDetail(reportId: number): Promise<Report> {
        const response = await apiClient.get<Report>(`/report/${reportId}`)
        return response.data
    },

    /**
     * 레포트 삭제
     */
    async deleteReport(reportId: number): Promise<string> {
        const response = await apiClient.delete<string>(`/report/${reportId}`)
        return response.data
    }
}
