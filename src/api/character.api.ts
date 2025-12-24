import apiClient from './client'
import type { CharacterResponse } from './types'

/**
 * 캐릭터 관련 API
 */
export const characterApi = {
    /**
     * 캐릭터 전체 목록 조회
     */
    async getAllCharacters(): Promise<CharacterResponse[]> {
        const response = await apiClient.get<CharacterResponse[]>('/character')
        return response.data
    },

    /**
     * 내 캐릭터 조회
     */
    async getMyCharacters(): Promise<CharacterResponse[]> {
        const response = await apiClient.get<CharacterResponse[]>('/character/my-foody')
        return response.data
    }
}
