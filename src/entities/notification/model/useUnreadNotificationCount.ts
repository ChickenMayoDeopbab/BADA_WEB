import { useQuery } from '@tanstack/react-query'
import { getNotifications } from '../api/notificationApi'

export const notificationQueryKeys = {
  all: ['notifications'] as const,
  unread: ['notifications', 'unread-count'] as const,
}

/** 읽지 않은 알림 수를 서버에서 주기적으로 동기화합니다. */
export const useUnreadNotificationCount = () =>
  useQuery({
    queryKey: notificationQueryKeys.unread,
    queryFn: async ({ signal }) => (await getNotifications('UNREAD', 0, signal))?.unreadCount ?? 0,
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })
