<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

onMounted(async () => {
    const token = route.query.token as string
    if (token) {
        // 토큰 저장
        localStorage.setItem('token', token)
        localStorage.setItem('isLoggedIn', 'true')
        authStore.token = token
        
        try {
            // 사용자 정보 로드
            await authStore.loadUserInfo()

            // ROLE_GUEST 체크
            if (authStore.user?.role === 'ROLE_GUEST') {
                alert('서비스 이용을 위해 추가 정보 입력이 필요합니다.')
                router.push('/my-page')
            } else {
                // 메인 페이지로 이동
                router.push('/')
            }
        } catch (error) {
            console.error('Failed to load user info during oauth callback:', error)
            alert('로그인 처리 중 오류가 발생했습니다.')
            router.push('/login')
        }
    } else {
        alert('로그인 정보가 없습니다.')
        router.push('/login')
    }
})
</script>

<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-50">
        <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p class="text-gray-600 text-lg">로그인 처리 중입니다...</p>
        </div>
    </div>
</template>
