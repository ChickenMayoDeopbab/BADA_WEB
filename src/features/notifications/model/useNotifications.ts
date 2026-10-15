import {
  getNotifications,
  notificationQueryKeys,
  markNotificationRead,
  type AppNotification,
  type NotificationFilter,
} from '@entities/notification'
import { getApiErrorMessage } from '@shared/api'
import { routePaths } from '@shared/config'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getNotificationDestination } from './notificationPresentation'

const notificationKeys = {
  list: (filter: NotificationFilter) => ['notifications', 'list', filter] as const,
}

/** 알림 필터·페이지 조회·읽음 처리 후 이동과 실패 재시도를 관리합니다. */
export const useNotifications = () => {
  const [filter, setFilter] = useState<NotificationFilter>('ALL')
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const isOpening = useRef(false)
  const isActive = useRef(true)
  const [openingId, setOpeningId] = useState<number | null>(null)
  const [openError, setOpenError] = useState('')
  const list = useInfiniteQuery({
    queryKey: notificationKeys.list(filter),
    queryFn: ({ pageParam, signal }) => getNotifications(filter, pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.notifications.last ? undefined : lastPage.notifications.number + 1,
    refetchOnWindowFocus: true,
  })
  const read = useMutation({ mutationFn: markNotificationRead, retry: false })

  useEffect(() => {
    isActive.current = true
    return () => {
      isActive.current = false
    }
  }, [])

  /** 서버 읽음 처리가 성공해야 목록을 갱신하고 관련 화면으로 이동합니다. */
  const handleOpenNotification = async (notification: AppNotification) => {
    if (isOpening.current) return
    isOpening.current = true
    setOpeningId(notification.notificationId)
    setOpenError('')
    try {
      if (!notification.read) {
        await read.mutateAsync(notification.notificationId)
        await queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all })
      }
      if (!isActive.current) return
      const destination = getNotificationDestination(notification)
      if (destination) navigate(destination)
    } catch (error) {
      if (isActive.current)
        setOpenError(getApiErrorMessage(error, '알림을 읽음 처리하지 못했어요. 다시 눌러 주세요.'))
    } finally {
      isOpening.current = false
      if (isActive.current) setOpeningId(null)
    }
  }

  /** 이전 화면이 없는 직접 접근에서도 대시보드로 돌아갈 수 있습니다. */
  const handleBack = () => {
    if (location.key !== 'default') navigate(-1)
    else navigate(routePaths.dashboard, { replace: true })
  }

  /** 필터를 전환하며 이전 읽음 처리 오류는 정리합니다. */
  const handleFilterChange = (nextFilter: NotificationFilter) => {
    setOpenError('')
    setFilter(nextFilter)
  }

  return {
    filter,
    handleFilterChange,
    handleOpenNotification,
    handleBack,
    openingId,
    openError,
    notifications: list.data?.pages.flatMap((page) => page.notifications.content) ?? [],
    unreadCount: list.data?.pages[0]?.unreadCount ?? 0,
    isLoading: list.isPending,
    isError: list.isError && !list.isFetchNextPageError,
    errorMessage: getApiErrorMessage(list.error, '알림을 불러오지 못했어요.'),
    isFetching: list.isFetching,
    hasNextPage: list.hasNextPage,
    isFetchingNextPage: list.isFetchingNextPage,
    isNextPageError: list.isFetchNextPageError,
    handleLoadMore: () => {
      if (!list.isFetching) void list.fetchNextPage()
    },
    handleRetry: () => void list.refetch(),
  }
}
