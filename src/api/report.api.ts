import apiClient from './client'
import type {
    ReportRequest,
    ReportListResponse,
    ReportResponse,
    PageResponse,
    ReportComment
} from './types'

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
    ): Promise<PageResponse<ReportListResponse>> {
        const params: any = { page }
        if (startDate) params.startDate = startDate
        if (endDate) params.endDate = endDate

        const response = await apiClient.get<PageResponse<ReportListResponse>>('/report', { params })
        return response.data
    },

    /**
     * 레포트 상세 조회
     */
    async getReportDetail(reportId: number): Promise<ReportResponse> {
        const response = await apiClient.get<ReportResponse>(`/report/${reportId}`)
        return response.data
    },

    /**
     * 레포트 삭제
     */
    /**
     * 레포트 삭제
     */
    async deleteReport(reportId: number): Promise<string> {
        const response = await apiClient.delete<string>(`/report/${reportId}`)
        return response.data
    },

    /**
     * 공유 상태 변경
     */
    async toggleShare(reportId: number): Promise<string> {
        const response = await apiClient.patch<string>(`/report/${reportId}/share`)
        return response.data
    },

    /**
     * 공유된 레포트 목록 조회
     */
    async getSharedReportList(page: number = 1): Promise<PageResponse<ReportResponse>> {
        const response = await apiClient.get<PageResponse<ReportResponse>>('/report/shared', {
            params: { page }
        })
        return response.data
    },

    /**
     * 댓글 등록
     */
    async addComment(data: { reportId: number, comment: string }): Promise<string> {
        const response = await apiClient.post<string>('/report/comment', data)
        return response.data
    },

    /**
     * 댓글 조회
     */
    async getComments(reportId: number): Promise<ReportComment[]> {
        const response = await apiClient.get<ReportComment[]>(`/report/${reportId}/comment`)
        return response.data
    },

    /**
     * 댓글 삭제
     */
    async deleteComment(commentId: number): Promise<string> {
        const response = await apiClient.delete<string>(`/report/comment/${commentId}`)
        return response.data
    }
}
