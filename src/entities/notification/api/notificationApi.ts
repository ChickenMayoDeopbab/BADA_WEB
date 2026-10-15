import { httpClient } from '@shared/api'
import type { ApiResponse } from '@shared/types'
import type { AppNotification, NotificationFilter, NotificationList } from '../model/types'

const NOTIFICATIONS_PATH = '/api/v1/notifications'

/** 서버의 보관 기간과 전체·안읽음 필터를 적용한 알림 페이지를 조회합니다. */
export const getNotifications = async (
  filter: NotificationFilter,
  page: number,
  signal?: AbortSignal,
) => {
  const { data } = await httpClient.get<ApiResponse<NotificationList>>(NOTIFICATIONS_PATH, {
    params: { filter, page, size: 20 },
    signal,
  })
  return data.data
}

/** 읽음 처리된 알림을 반환하며 요청 실패 시 기존 상태를 유지합니다. */
export const markNotificationRead = async (notificationId: number) => {
  const { data } = await httpClient.patch<ApiResponse<AppNotification>>(
    `${NOTIFICATIONS_PATH}/${notificationId}/read`,
  )
  return data.data
}
