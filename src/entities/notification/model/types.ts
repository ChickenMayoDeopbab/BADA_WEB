export type NotificationFilter = 'ALL' | 'UNREAD'

export type NotificationType =
  | 'POST_COMMENT'
  | 'COMMENT_REPLY'
  | 'POST_LIKE'
  | 'POST_RELATE'
  | 'POST_CHEER'
  | 'TRAINING_REMINDER'

/** 서버가 보관하는 커뮤니티·예약 훈련 알림입니다. */
export interface AppNotification {
  notificationId: number
  type: NotificationType
  title: string
  message: string
  actorUserId: number | null
  actorName: string | null
  actorProfileImage: string | null
  postId: number | null
  commentId: number | null
  scheduleId: number | null
  read: boolean
  createdAt: string
}

/** 필터와 관계없이 전체 미확인 개수를 함께 반환하는 페이지입니다. */
export interface NotificationList {
  notifications: {
    content: AppNotification[]
    number: number
    last: boolean
    totalElements: number
    totalPages: number
  }
  unreadCount: number
}
