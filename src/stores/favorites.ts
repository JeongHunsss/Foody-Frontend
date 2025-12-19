import { defineStore } from 'pinia'
import { ref } from 'vue'
import { foodApi } from '@/api/food.api'
import type { FavoriteResponse, FavoriteRequest, FavoriteCodeResponse } from '@/api/types'
import { showError } from '@/utils/errorHandler'

export const useFavoriteStore = defineStore('favorites', () => {
  // State
  const favorites = ref<FavoriteResponse[]>([])
  // 모든 찜 목록의 ID 맵 (Key: foodCode, Value: favoriteId) - 페이지네이션과 무관하게 전체 상태 관리
  const favoriteMap = ref(new Map<string, number>())
  const isLoading = ref(false)
  const error = ref('')

  // Getters
  // favoriteFoodCodes getter는 이제 불필요하거나 favoriteMap의 keySet으로 대체 가능하지만,
  // 호환성을 위해 유지하거나 제거. 여기서는 Map을 직접 State로 쓰므로 getter 제거 가능.

  // Actions
  const fetchFavorites = async () => {
    isLoading.value = true
    error.value = ''
    try {
      // 1. 찜 목록 (화면 표시용 1페이지)
      const listResponse = await foodApi.getFavoriteList(1)
      favorites.value = listResponse.content || []

      // 2. 전체 찜 코드 및 ID (isFavorite 체크용)
      const codesResponse: FavoriteCodeResponse[] = await foodApi.getAllFavoriteCodes()
      favoriteMap.value.clear()
      codesResponse.forEach(item => {
        // userFoodCode가 있으면 'custom-' 접두사를 붙여서 Map에 저장 (UI와 통일)
        const code = item.foodCode || (item.userFoodCode ? `custom-${item.userFoodCode}` : '')
        if (code) {
          favoriteMap.value.set(code, item.favoriteId)
        }
      })
    } catch (err) {
      error.value = showError(err)
      console.error('Failed to fetch favorites:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 페이지네이션용 별도 호출 (상태 저장 안함, 리턴만 함)
  const fetchFavoritesPage = async (page: number, filter?: string) => {
    return await foodApi.getFavoriteList(page, filter)
  }

  const addFavorite = async (foodCode: string, isUserFood: boolean = false) => {
    isLoading.value = true
    error.value = ''
    try {
      let request: FavoriteRequest = {}
      const codeStr = foodCode.toString()

      // 1. 'custom-' 접두사가 있는 경우 -> UserFood
      if (codeStr.startsWith('custom-')) {
        const parsed = parseInt(codeStr.replace('custom-', ''), 10)
        if (!isNaN(parsed)) {
          request.userFoodCode = parsed
        }
      }
      // 2. 숫자로만 구성된 경우 -> UserFood (사용자 요청 사항 반영)
      else if (!isNaN(Number(codeStr))) {
        request.userFoodCode = parseInt(codeStr, 10)
      }
      // 3. 그 외 (일반 문자열) -> DB Food
      else {
        request.foodCode = codeStr
      }

      if (!request.foodCode && !request.userFoodCode) {
        console.warn("Invalid fav request detected", foodCode)
        // Fallback logic if needed, or allow it to fail at API level
      }

      console.log('Sending Favorite Request:', request)

      await foodApi.addFavorite(request)
      await fetchFavorites() // 목록 갱신
    } catch (err) {
      error.value = showError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }


  const removeFavorite = async (favoriteId: number) => {
    isLoading.value = true
    error.value = ''
    try {
      await foodApi.deleteFavorite(favoriteId)
      // 로컬 상태 업데이트
      favorites.value = favorites.value.filter(fav => fav.id !== favoriteId)

      // Map에서도 제거
      for (const [code, id] of favoriteMap.value.entries()) {
        if (id === favoriteId) {
          favoriteMap.value.delete(code)
          break
        }
      }
    } catch (err) {
      error.value = showError(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // 음식 코드로 찜한 항목 ID 찾기
  const findFavoriteIdByCode = (foodCode: string): number | undefined => {
    return favoriteMap.value.get(foodCode)
  }

  const isFavorite = (foodCode: string): boolean => {
    return favoriteMap.value.has(foodCode)
  }

  const clearError = () => {
    error.value = ''
  }

  return {
    favorites,
    isLoading,
    error,
    favoriteMap, // Expose map if needed, or keeping it internal is fine but isFavorite/find... use it
    fetchFavorites,
    fetchFavoritesPage,
    addFavorite,
    removeFavorite,
    findFavoriteIdByCode,
    isFavorite,
    clearError
  }
})
