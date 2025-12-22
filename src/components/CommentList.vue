<script setup lang="ts">
import { ref, onMounted, defineProps } from 'vue'
import { reportApi } from '@/api/report.api'
import type { ReportComment } from '@/api/types'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  reportId: number
}>()

const authStore = useAuthStore()
const comments = ref<ReportComment[]>([])
const newComment = ref('')

const fetchComments = async () => {
  try {
    comments.value = await reportApi.getComments(props.reportId)
  } catch (error) {
    console.error('Failed to fetch comments', error)
  }
}

const handleAddComment = async () => {
  if (!newComment.value.trim()) return

  try {
    await reportApi.addComment({
      reportId: props.reportId,
      comment: newComment.value
    })
    newComment.value = ''
    await fetchComments() // Refresh list
  } catch (error) {
    alert('댓글 등록에 실패했습니다.')
    console.error(error)
  }
}

const handleDeleteComment = async (commentId: number) => {
  if (!confirm('댓글을 삭제하시겠습니까?')) return

  try {
    await reportApi.deleteComment(commentId)
    await fetchComments()
  } catch (error) {
    alert('삭제 권한이 없거나 오류가 발생했습니다.')
  }
}

onMounted(() => {
  fetchComments()
})
</script>

<template>
  <div class="mt-8">
    <h3 class="font-bold text-lg mb-4">댓글</h3>
    
    <!-- Comment List -->
    <div v-if="comments.length > 0" class="space-y-4 mb-6">
      <div v-for="comment in comments" :key="comment.id" class="bg-gray-50 p-4 rounded-xl">
        <div class="flex justify-between items-start mb-2">
          <span class="font-bold text-sm text-gray-700">{{ comment.author }}</span>
          <span class="text-xs text-gray-400">{{ new Date(comment.createdAt).toLocaleDateString() }}</span>
        </div>
        <p class="text-gray-600 text-sm whitespace-pre-wrap">{{ comment.comment }}</p>
        <div v-if="authStore.user?.id === comment.author || authStore.isAdmin" class="mt-2 text-right">
             <button @click="handleDeleteComment(comment.id)" class="text-xs text-red-400 hover:text-red-500">삭제</button>
        </div>
      </div>
    </div>
    <div v-else class="text-center text-gray-400 py-4 mb-6">
      첫 번째 댓글을 남겨보세요!
    </div>

    <!-- Add Comment -->
    <div class="flex gap-2">
      <input 
        v-model="newComment"
        type="text" 
        placeholder="댓글을 입력하세요..." 
        class="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        @keyup.enter="handleAddComment"
      />
      <button 
        @click="handleAddComment"
        class="bg-emerald-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-emerald-600 transition-colors"
      >
        등록
      </button>
    </div>
  </div>
</template>
