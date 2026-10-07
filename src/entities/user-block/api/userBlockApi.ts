import { aiHttpClient } from '@shared/api'

export interface BlockedUser {
  user_id: number
  name: string | null
  profile_image_url: string | null
  blocked_at: string
}
export const getBlockedUsers = async () => (await aiHttpClient.get<{ blocked_users: BlockedUser[] }>('/api/v1/community/me/blocked-users')).data.blocked_users
export const blockUser = async (id: number) => { await aiHttpClient.put(`/api/v1/community/users/${id}/block`) }
export const unblockUser = async (id: number) => { await aiHttpClient.delete(`/api/v1/community/users/${id}/block`) }
