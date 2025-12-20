import { apiClient } from '@/api/client'

export interface ChatRoom {
    id: string
    userId: string
    expertId: string
    createdAt: string
}

export interface ChatMessage {
    id: number
    roomId: string
    senderId: string
    message: string
    sentAt: string
}

export const chatApi = {
    createOrGetRoom: async (reportId: number): Promise<ChatRoom> => {
        const { data } = await apiClient.post<ChatRoom>('/chat/room', { reportId })
        return data
    },

    getMessages: async (roomId: string): Promise<ChatMessage[]> => {
        const { data } = await apiClient.get<ChatMessage[]>(`/chat/room/${roomId}/messages`)
        return data
    },

    getExpertRooms: async (): Promise<ChatRoomResponse[]> => {
        const { data } = await apiClient.get<ChatRoomResponse[]>('/chat/expert/rooms')
        return data
    }
}

export interface ChatRoomResponse {
    id: string
    userId: string
    userName: string
    reportId: number
    createdAt: string
}
