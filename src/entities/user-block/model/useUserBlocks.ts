import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { blockUser, getBlockedUsers, unblockUser } from '../api/userBlockApi'

export const useBlockedUsers = () => useQuery({ queryKey: ['blocked-users'], queryFn: getBlockedUsers })
const useBlockMutation = (mutationFn: (id: number) => Promise<void>) => {
  const client = useQueryClient()
  return useMutation({ mutationFn, onSuccess: async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ['blocked-users'] }),
      client.invalidateQueries({ queryKey: ['community'] }),
    ])
  } })
}
export const useBlockUser = () => useBlockMutation(blockUser)
export const useUnblockUser = () => useBlockMutation(unblockUser)
