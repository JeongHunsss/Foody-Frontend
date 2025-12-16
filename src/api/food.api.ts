import apiClient from './client'
import type {
    FoodResponse,
    AiFoodResponse,
    FavoriteRequest,
    FavoriteResponse
} from './types'

export interface FoodListResponse {
    content: FoodResponse[]
    totalCount: number
    currentPage: number
    totalPages: number
}

/**
 * 음식 관련 API
 */
export const foodApi = {
    /**
     * 음식 목록 조회 (페이징, 검색, 카테고리 필터)
     * @param page 페이지 번호 (기본값: 1)
     * @param keyword 검색 키워드 (optional)
     * @param category 카테고리 필터 (optional)
     */
    async getFoodList(
        page: number = 1,
        keyword?: string,
        category?: string
    ): Promise<FoodListResponse> {
        const response = await apiClient.get<FoodListResponse>('/food/', {
            params: { page, keyword, category }
        })
        return response.data
    },

    /**
     * 음식 이미지 AI 분석
     * @param imageFile 분석할 이미지 파일
     */
    async analyzeFood(imageFile: File): Promise<AiFoodResponse> {
        const formData = new FormData()
        formData.append('image', imageFile)

        const response = await apiClient.post<AiFoodResponse>('/food/analyze', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return response.data
    },

    /**
     * 음식 카테고리 목록 조회
     * 인증 불필요
     */
    async getCategories(): Promise<string[]> {
        const response = await apiClient.get<string[]>('/food/categories')
        return response.data
    },

    /**
     * 찜 목록에 음식 추가
     * (인증 필요)
     */
    async addFavorite(data: FavoriteRequest): Promise<string> {
        const response = await apiClient.post<string>('/food/auth/favorite', data)
        return response.data
    },

    /**
     * 찜 목록 조회
     * (인증 필요)
     */
    async getFavoriteList(): Promise<FavoriteResponse[]> {
        const response = await apiClient.get<FavoriteResponse[]>('/food/auth/favorite')
        return response.data
    },

    /**
     * 찜 목록에서 삭제
     * (인증 필요)
     */
    async deleteFavorite(favoriteId: number): Promise<string> {
        const response = await apiClient.delete<string>('/food/auth/favorite', {
            params: { favoriteId }
        })
        return response.data
    }
}
