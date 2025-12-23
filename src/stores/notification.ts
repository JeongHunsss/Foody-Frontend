import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Notification {
    id: number
    message: string
    senderId: string
    time: Date
    roomId: string
}

export const useNotificationStore = defineStore('notification', () => {
    const notifications = ref<Notification[]>([])

    const hasUnread = computed(() => notifications.value.length > 0)
    const unreadCount = computed(() => notifications.value.length)

    const addNotification = (notification: Notification) => {
        // 중복 방지 (선택 사항)
        notifications.value.unshift(notification)
    }

    const clearNotificationsForRoom = (roomId: string) => {
        notifications.value = notifications.value.filter(n => n.roomId !== roomId)
    }

    const clearAll = () => {
        notifications.value = []
    }

    return {
        notifications,
        hasUnread,
        unreadCount,
        addNotification,
        clearNotificationsForRoom,
        clearAll
    }
})
