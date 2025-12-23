<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useFavoriteStore } from '@/stores/favorites'
import Navbar from '@/components/Navbar.vue'
import { Heart, Trash2, Search, ArrowRight, Utensils, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useFavoriteStore()
const { isLoading } = storeToRefs(store)

const searchQuery = ref('')
const selectedCategory = ref('전체')

// 페이지네이션 상태
const pageFavorites = ref<any[]>([]) // 현재 페이지의 찜 목록
const totalPages = ref(1)
const currentPage = ref(1)
const isPageLoading = ref(false)

const itemsPerPage = 8 // 상수는 UI 계산용으로만 사용 (실제 데이터는 서버가 8개 줌)

// 데이터 조회 Function
const fetchPageFavorites = async () => {
  isPageLoading.value = true
  try {
    let filter = undefined
    if (selectedCategory.value === '기본 음식') filter = 'GENERAL'
    else if (selectedCategory.value === '직접 입력') filter = 'CUSTOM'

    const response = await store.fetchFavoritesPage(currentPage.value, filter)
    pageFavorites.value = response.content
    totalPages.value = response.totalPages
  } catch (err) {
    console.error('페이지 로드 실패', err)
  } finally {
    isPageLoading.value = false
  }
}

onMounted(() => {
  fetchPageFavorites()
  // 스토어의 전체 찜 목록도 갱신 (헤더 하트 등 전역 상태용 - page 1만 가져옴)
  store.fetchFavorites() 
})


const categories = computed(() => {
  return ['전체', '기본 음식', '직접 입력']
})

// 필터링은 검색어 필터링만 클라이언트 사이드에서 할 수도 있지만, 
// 서버 사이드 검색 api가 없다면 현재 페이지 내에서만 검색됨.
// 하지만 사용자 경험상 전체 검색이 안되는건 아쉬움. 일단 API 스펙상 검색 파라미터가 없으므로 
// 현재 구현은 "현재 페이지 내 필터링" or "전체 다 가져오기 불가" 상태임.
// 여기서는 "현재 페이지 데이터"를 보여주는 것으로 변경함.
// *중요*: API에 검색 기능이 없으므로 검색 기능은 "현재 로드된 페이지 내 검색"으로 제한됨을 감안해야 함.

const filteredFavorites = computed(() => {
  return pageFavorites.value.filter(fav => {
    // 검색어 필터 (현재 페이지 내에서만 동작)
    const matchesSearch = searchQuery.value 
      ? fav.name.toLowerCase().includes(searchQuery.value.toLowerCase()) 
      : true
    
    // 카테고리 필터는 이제 서버 사이드에서 처리됨
    return matchesSearch
  })
})

// 페이지 변경 감지
watch(currentPage, () => {
  fetchPageFavorites()
})

// 카테고리 변경 시 페이지 1로 리셋하고 재조회 (API가 카테고리 필터링 지원 안하면 의미 없으나, UI 필터링 유지)
watch(selectedCategory, () => {
    // 현재는 API가 카테고리 필터를 받지 않으므로 클라이언트 필터링만 수행
    // 페이지 리셋 안함 (현재 페이지 내 필터)
    // 혹은 1페이지로 가야할 수도 있음.
    currentPage.value = 1
    fetchPageFavorites()
})



const handleRemove = async (favoriteId: number, name: string) => {
  if (confirm(`'${name}'을(를) 찜 목록에서 삭제하시겠습니까?`)) {
    await store.removeFavorite(favoriteId)
    // 삭제 후 리스트 갱신
    await fetchPageFavorites()
  }
}

const goToMealManagement = () => {
  router.push('/meal-management')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <Navbar />
    
    <main class="max-w-7xl mx-auto px-6 py-12">
      <!-- Header -->
      <div class="mb-12 text-center md:text-left">
        <h1 class="text-4xl font-extrabold text-emerald-600 mb-4 font-pyeongtaek" style="font-family: 'PyeongtaekSemiconductor', sans-serif !important;">
          나만의 찜한 음식
        </h1>
        <p class="text-gray-600 text-lg">자주 먹는 음식을 모아보고 관리하세요.</p>
      </div>

      <!-- Controls -->
      <div class="bg-white rounded-2xl shadow-lg p-6 mb-10 border border-gray-100">
        <div class="flex flex-col md:flex-row gap-6 justify-between items-center">
          
          <!-- Search -->
          <div class="relative w-full md:w-96">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="음식 이름 검색..."
              class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <!-- Category Filter -->
          <div class="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
            <button
              v-for="cat in categories"
              :key="cat"
              @click="selectedCategory = cat"
              :class="[
                'px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200',
                selectedCategory === cat
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              {{ cat }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isPageLoading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="pageFavorites.length === 0" class="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full mb-6">
          <Heart :size="40" />
        </div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2" style="font-family: 'PyeongtaekSemiconductor', sans-serif;">아직 찜한 음식이 없어요</h3>
        <p class="text-gray-500 mb-8" style="font-family: 'Pretendard', sans-serif;">자주 먹는 음식을 찜해두면 식단 기록이 더 편해져요!</p>
        <button
          @click="goToMealManagement"
          class="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          <Utensils :size="20" />
          <span>식단 기록하러 가기</span>
        </button>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <TransitionGroup
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-300 ease-in absolute"
          enter-from-class="opacity-0 transform translate-y-4"
          leave-to-class="opacity-0 transform scale-95"
          move-class="transition-transform duration-300"
        >
          <div
            v-for="fav in filteredFavorites"
            :key="fav.favoriteId"
            class="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-transparent hover:border-emerald-200 relative overflow-hidden"
          >
            <!-- Card Header -->
            <div class="flex justify-between items-start mb-4 relative z-10">
              <div>
                <span class="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-md mb-2">
                  {{ fav.userFoodCode ? '직접 입력' : '기본 음식' }}
                </span>
                <h3 class="text-xl font-bold text-gray-800 leading-tight mb-1 group-hover:text-emerald-600 transition-colors">
                  {{ fav.name }}
                </h3>
                <p class="text-sm text-gray-500">영양소 기준량: {{ fav.standard }}</p>
              </div>
              
              <button
                @click="handleRemove(fav.favoriteId, fav.name)"
                class="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                title="찜 목록에서 삭제"
              >
                <Heart class="fill-current text-red-500" :size="24" />
              </button>
            </div>

            <!-- Nutrition Info -->
            <div class="space-y-3 mb-6 relative z-10">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">에너지</span>
                <span class="font-bold text-gray-900">{{ fav.kcal }} kcal</span>
              </div>
              
              <!-- Mini Graph -->
              <div class="flex h-2 rounded-full overflow-hidden bg-gray-100">
                <div class="bg-blue-400" :style="{ width: `${(fav.carb / (fav.carb + fav.protein + fav.fat || 1)) * 100}%` }"></div>
                <div class="bg-red-400" :style="{ width: `${(fav.protein / (fav.carb + fav.protein + fav.fat || 1)) * 100}%` }"></div>
                <div class="bg-yellow-400" :style="{ width: `${(fav.fat / (fav.carb + fav.protein + fav.fat || 1)) * 100}%` }"></div>
              </div>

              <div class="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-gray-600">
                <div class="flex justify-between">
                  <span class="flex items-center gap-1">
                    <div class="w-2 h-2 rounded-full bg-blue-400"></div>
                    탄수화물
                  </span>
                  <span>{{ fav.carb }}g</span>
                </div>
                <div class="flex justify-between">
                  <span class="flex items-center gap-1">
                    <div class="w-2 h-2 rounded-full bg-red-400"></div>
                    단백질
                  </span>
                  <span>{{ fav.protein }}g</span>
                </div>
                <div class="flex justify-between">
                  <span class="flex items-center gap-1">
                    <div class="w-2 h-2 rounded-full bg-yellow-400"></div>
                    지방
                  </span>
                  <span>{{ fav.fat }}g</span>
                </div>
                <div class="flex justify-between">
                  <span class="flex items-center gap-1">
                    <div class="w-2 h-2 rounded-full bg-purple-400"></div>
                    당
                  </span>
                  <span>{{ fav.sugar }}g</span>
                </div>
                <div class="flex justify-between">
                  <span class="flex items-center gap-1">
                    <div class="w-2 h-2 rounded-full bg-orange-400"></div>
                    나트륨
                  </span>
                  <span>{{ fav.natrium }}g</span>
                </div>
              </div>
            </div>

            <!-- Action -->
            <!-- 
            <button class="w-full py-3 rounded-xl bg-gray-50 text-gray-700 font-medium hover:bg-emerald-50 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 group-hover:shadow-inner">
              <span>자세히 보기</span>
              <ArrowRight :size="16" />
            </button>
             -->
             
             <!-- Decorative Background Blob -->
             <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full blur-3xl group-hover:bg-emerald-100 transition-colors duration-500 opacity-50"></div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="mt-12 flex justify-center items-center gap-2">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="p-2 rounded-lg bg-emerald-100 text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-200 transition-colors"
        >
          <ChevronLeft :size="20" />
        </button>

        <span class="text-gray-600 font-medium px-4">
          {{ currentPage }} / {{ totalPages }}
        </span>

        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="p-2 rounded-lg bg-emerald-100 text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-200 transition-colors"
        >
          <ChevronRight :size="20" />
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
