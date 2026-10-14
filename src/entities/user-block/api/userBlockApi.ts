import { aiHttpClient } from '@shared/api'
import { httpClient } from '@shared/api'

export interface BlockedUser {
  user_id: number
  name: string | null
  profile_image_url: string | null
  blocked_at: string
}
export const getBlockedUsers = async () => {
  const users = (await aiHttpClient.get<{ blocked_users: BlockedUser[] }>('/api/v1/community/me/blocked-users')).data.blocked_users
  return Promise.all(users.map(async user => {
    const image = user.profile_image_url
    if (!image || /^https?:\/\//.test(image)) return user
    try {
      const { data } = await httpClient.post<{ data: { url: string } }>('/api/v1/file', undefined, { params: { s3Key: image } })
      return { ...user, profile_image_url: data.data.url }
    } catch {
      return { ...user, profile_image_url: null }
    }
  }))
}
export const blockUser = async (id: number) => { await aiHttpClient.put(`/api/v1/community/users/${id}/block`) }
export const unblockUser = async (id: number) => { await aiHttpClient.delete(`/api/v1/community/users/${id}/block`) }
