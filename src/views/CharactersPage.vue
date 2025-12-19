<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Sparkles } from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'
import logoImage from '@/assets/foody_logo.png'
import { characterApi } from '@/api/character.api'
import { showError } from '@/utils/errorHandler'

// Import character images
import foodyEggImage from '@/assets/characters/foody_egg.png'
import sproutFoodyImage from '@/assets/characters/ssassak_foody.png'
import slimanderImage from '@/assets/characters/slimander.png'
import tandanjioImage from '@/assets/characters/tandanzio.png'
import wangmaniImage from '@/assets/characters/wangmani.png'
import jammaniImage from '@/assets/characters/jammani.png'
import jjaguriImage from '@/assets/characters/jjaguri.png'
import yomaniImage from '@/assets/characters/yomani.png'
import jujeonbuoungImage from '@/assets/characters/jujeonbueong.png'
import daldaguriImage from '@/assets/characters/daldaguri.png'

interface Character {
  id: number
  name: string
  image: string
  description: string
  color: string
}

const characters = ref<Character[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

// 이미지 매핑 (백엔드에서 이미지 경로를 제공하지 않는 경우)
const imageMap: Record<number, string> = {
  1: foodyEggImage,
  2: sproutFoodyImage,
  3: slimanderImage,
  4: tandanjioImage,
  5: wangmaniImage,
  6: jammaniImage,
  7: jjaguriImage,
  8: yomaniImage,
  9: jujeonbuoungImage,
  10: daldaguriImage
}

// 색상 매핑
const colorMap: Record<number, string> = {
  1: "from-green-400 to-emerald-500",
  2: "from-yellow-400 to-orange-400",
  3: "from-emerald-400 to-green-500",
  4: "from-green-500 to-teal-600",
  5: "from-orange-400 to-red-400",
  6: "from-gray-400 to-slate-500",
  7: "from-blue-400 to-cyan-500",
  8: "from-amber-400 to-yellow-500",
  9: "from-purple-400 to-violet-500",
  10: "from-pink-400 to-rose-500"
}

const loadCharacters = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const data = await characterApi.getAllCharacters()
    
    // 백엔드 데이터에 이미지와 색상 추가
    characters.value = data.map(char => ({
      id: char.id,
      name: char.name,
      description: char.description,
      image: imageMap[char.id] || foodyEggImage,
      color: colorMap[char.id] || "from-green-400 to-emerald-500"
    }))
  } catch (error) {
    errorMessage.value = showError(error, 'Load Characters')
    console.error('Failed to load characters:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadCharacters()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50/40 via-emerald-50/30 to-teal-50/40">
    <Navbar />

    <main class="max-w-7xl mx-auto px-6 py-12">
      <!-- Title Section -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :enter="{ opacity: 1, y: 0 }"
        class="text-center mb-12"
      >
        <div
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :enter="{ opacity: 1, scale: 1, transition: { delay: 200 } }"
          class="inline-flex items-center gap-2 bg-emerald-100/60 px-4 py-2 rounded-full mb-6 border border-emerald-200"
        >
          <Sparkles :size="16" class="text-emerald-600" />
          <span class="text-sm text-emerald-700">다양한 푸디 친구들</span>
        </div>

        <h1 class="text-gray-900 mb-4">캐릭터 도감</h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          당신의 식단에 따라 다양한 푸디로 변신해요!<br>각 푸디는 특별한 식습관을 대표한답니다.
        </p>
      </div>

      <!-- Characters Grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="(character, index) in characters"
          :key="character.id"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: index * 100, duration: 500 } }"
        >
          <div
            v-motion
            :hovered="{ y: -8, scale: 1.02 }"
            class="bg-white rounded-3xl shadow-lg border-2 border-emerald-100/60 overflow-hidden hover:shadow-2xl transition-all duration-300"
          >
            <!-- Character Image Container -->
            <div :class="['relative bg-gradient-to-br', character.color, 'p-8 flex items-center justify-center h-64']">
              <div
                v-motion
                :initial="{ scale: 0.8, opacity: 0 }"
                :enter="{ scale: 1, opacity: 1, transition: { delay: index * 100 + 300 } }"
                class="relative"
              >
                <img
                  v-motion
                  :initial="{ y: 0 }"
                  :enter="{
                    y: [0, -10, 0],
                    transition: {
                      duration: 2000 + index * 200,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }
                  }"
                  :src="character.image"
                  :alt="character.name"
                  class="w-48 h-48 object-contain drop-shadow-2xl"
                />
              </div>

              <!-- Character Number Badge -->
              <div class="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                <span class="text-sm text-gray-700">#{{ character.id }}</span>
              </div>
            </div>

            <!-- Character Info -->
            <div class="p-6">
              <h2 class="text-gray-900 mb-3">{{ character.name }}</h2>
              <p class="text-gray-600 leading-relaxed">{{ character.description }}</p>
            </div>
          </div>
        </div>
      </div>

    </main>

    <!-- Footer -->
    <footer class="bg-white/80 border-t border-emerald-100/50 mt-20">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-3">
            <img :src="logoImage" alt="Foody Logo" class="h-10 object-contain" />
            <span class="text-sm text-gray-500">© 2024 Foody. All rights reserved.</span>
          </div>
          <div class="flex gap-6 text-sm text-gray-600">
            <a href="#" class="hover:text-emerald-600 transition-colors">개인정보처리방침</a>
            <a href="#" class="hover:text-emerald-600 transition-colors">이용약관</a>
            <a href="#" class="hover:text-emerald-600 transition-colors">고객센터</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
