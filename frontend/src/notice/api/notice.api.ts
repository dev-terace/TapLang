import api from "@/shared/auth/api.config"

export interface NoticeItem {
  id: number
  title: string
  content: string
  isUrgent: boolean
  createdAt: string
  updatedAt: string
}

export const noticeApi = {
  async getNotices(): Promise<NoticeItem[]> {
    const res = await api.get('/api/notices')
    return res.data.data
  },
  async createNotice(data: { title: string; content: string; isUrgent?: boolean }): Promise<NoticeItem> {
    const res = await api.post('/api/notices', data)
    return res.data.data
  },
  async updateNotice(id: number, data: { title: string; content: string; isUrgent?: boolean }): Promise<NoticeItem> {
    const res = await api.put(`/api/notices/${id}`, data)
    return res.data.data
  },
  async deleteNotice(id: number): Promise<void> {
    await api.delete(`/api/notices/${id}`)
  },

  async checkAdmin(): Promise<boolean> {
    try {
      const res = await api.get('/api/notices/admin')
      return res.data.isAdmin || false
    } catch {
      return false
    }
  },

}