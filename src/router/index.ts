import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'main',
            component: () => import('@/views/MainPage.vue')
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/LoginPage.vue')
        },
        {
            path: '/signup',
            name: 'signup',
            component: () => import('@/views/SignupPage.vue')
        },
        {
            path: '/analyze',
            name: 'analyze',
            component: () => import('@/views/AnalyzePage.vue')
        },
        {
            path: '/analyze/foods',
            name: 'food-search',
            component: () => import('@/views/FoodSearchPage.vue')
        },
        {
            path: '/analyze/result/:id?',
            name: 'analysis-result',
            component: () => import('@/views/AnalysisResultPage.vue')
        },
        {
            path: '/meal-management',
            name: 'meal-management',
            component: () => import('@/views/MealManagementPage.vue')
        },
        {
            path: '/characters',
            name: 'characters',
            component: () => import('@/views/CharactersPage.vue')
        },
        {
            path: '/my-page',
            name: 'my-page',
            component: () => import('@/views/MyPage.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/meal-community',
            name: 'community',
            component: () => import('@/views/MealCommunityPage.vue')
        },
        {
            path: '/favorites',
            name: 'favorites',
            component: () => import('@/views/FavoritesPage.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/admin',
            name: 'admin',
            component: () => import('@/views/AdminPage.vue'),
            meta: { requiresAuth: true, requiresAdmin: true }
        },
        {
            path: '/oauth/callback',
            name: 'oauth-callback',
            component: () => import('@/views/OAuthCallback.vue')
        }
    ]
})

// Navigation guard for authentication
router.beforeEach((to, _from, next) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const isAdmin = localStorage.getItem('userRole') === 'ADMIN'

    if (to.meta.requiresAuth && !isLoggedIn) {
        next({ name: 'login' })
    } else if (to.meta.requiresAdmin && !isAdmin) {
        // 개발 중: 로그인만 되어 있으면 관리자 페이지 접근 가능
        if (isLoggedIn) {
            next()
        } else {
            next({ name: 'main' })
        }
    } else {
        next()
    }
})

export default router
