import apiClient from './client'
import type {
    FoodResponse,
    AiFoodResponse,
    FavoriteRequest,
    FavoriteResponse,
    FavoriteCodeResponse,
    PageResponse
} from './types'

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
    ): Promise<PageResponse<FoodResponse>> {
        const response = await apiClient.get<PageResponse<FoodResponse>>('/food/', {
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
     * 사용자 정의 음식 목록 조회
     * (인증 필요)
     */
    async getUserFoodList(page: number = 1): Promise<PageResponse<FoodResponse>> {
        const response = await apiClient.get<PageResponse<FoodResponse>>('/food/auth/user-food', {
            params: { page }
        })
        return response.data
    },



    /**
     * 찜 목록 조회
     * (인증 필요)
     */
    async getFavoriteList(page: number = 1, filter?: string): Promise<PageResponse<FavoriteResponse>> {
        const response = await apiClient.get<PageResponse<FavoriteResponse>>('/food/auth/favorite', {
            params: { page, filter }
        })
        return response.data
    },

    /**
     * 모든 찜 코드 조회 (isFavorite 체크용)
     */
    async getAllFavoriteCodes(): Promise<FavoriteCodeResponse[]> {
        const { data } = await apiClient.get<FavoriteCodeResponse[]>('/food/auth/favorite/codes')
        return data
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
