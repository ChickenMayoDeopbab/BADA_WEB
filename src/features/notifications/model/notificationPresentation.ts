import type { AppNotification } from '@entities/notification'
import { routePaths } from '@shared/config'

/** 알림 발생 시점을 읽기 쉬운 상대 시간으로 표시합니다. */
export const formatNotificationTime = (createdAt: string, now = Date.now()) => {
  const timestamp = new Date(createdAt).getTime()
  if (!Number.isFinite(timestamp)) return ''
  const minutes = Math.max(0, Math.floor((now - timestamp) / 60_000))
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`
  return `${Math.floor(minutes / 1440)}일 전`
}

/** 서버가 제공한 식별자만 사용해 웹에서 지원하는 관련 화면으로 연결합니다. */
export const getNotificationDestination = (notification: AppNotification) => {
  if (notification.type === 'TRAINING_REMINDER') return routePaths.training
  if (notification.postId != null)
    return routePaths.communityPost.replace(':postId', String(notification.postId))
  return null
}

/** 커뮤니티 알림은 활동한 사용자, 훈련 알림은 훈련 제목을 표시합니다. */
export const getNotificationTitle = (notification: AppNotification) =>
  notification.type === 'TRAINING_REMINDER'
    ? notification.title || '시나리오 훈련'
    : notification.actorName || notification.title || '커뮤니티'
