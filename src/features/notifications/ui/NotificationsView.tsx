import type { AppNotification } from '@entities/notification'
import backIcon from '@shared/assets/notifications/back.svg'
import emptyIcon from '@shared/assets/notifications/empty.svg'
import defaultProfile from '@shared/assets/notifications/default-profile.png'
import trainingProfile from '@shared/assets/notifications/training-profile.png'
import { ListSkeleton, LoadingSpinner, StatusState } from '@shared/ui'
import { useId } from 'react'
import { formatNotificationTime, getNotificationTitle } from '../model/notificationPresentation'
import { useNotifications } from '../model/useNotifications'
import { useNotificationAvatar } from '../model/useNotificationAvatar'

/** 깨진 사용자 사진 대신 Figma의 기본 프로필을 표시합니다. */
const NotificationAvatar = ({ notification }: { notification: AppNotification }) => {
  const avatar = useNotificationAvatar(notification)
  return (
    <span className="size-10 relative shrink-0 overflow-hidden rounded-pill bg-fill-alternative">
      <img src={defaultProfile} alt="" className="inset-0 size-10 absolute object-cover" />
      {avatar.isTraining && (
        <img src={trainingProfile} alt="" className="inset-0 size-10 absolute object-cover" />
      )}
      {!avatar.isTraining && avatar.profileUrl && (
        <img
          src={avatar.profileUrl}
          alt=""
          className="inset-0 size-10 absolute object-cover"
          onError={avatar.handleError}
        />
      )}
    </span>
  )
}

/** Figma의 전체·안읽음 목록과 빈 상태를 서비스 레이아웃 안에 표시합니다. */
export const NotificationsView = () => {
  const notifications = useNotifications()
  const id = useId()
  const tabs = [
    { value: 'ALL', label: '전체' },
    { value: 'UNREAD', label: '안읽음' },
  ] as const
  return (
    <main className="min-w-0 px-10 pt-6 max-md:px-0 max-md:pt-0 flex flex-1 flex-col text-label-normal">
      <header className="min-h-16 gap-3 max-md:justify-between max-md:bg-background-normal max-md:px-2 flex items-center">
        <button
          type="button"
          onClick={notifications.handleBack}
          aria-label="이전 화면으로"
          className="size-16 flex shrink-0 items-center justify-center rounded-control transition-colors hover:bg-fill-neutral"
        >
          <img src={backIcon} alt="" />
        </button>
        <h1 className="max-md:text-headline1 text-title1 font-bold text-label-neutral">알림</h1>
        <span className="size-16 max-md:block hidden" aria-hidden="true" />
      </header>
      <div className="max-w-5xl flex w-full flex-1 flex-col">
        <div
          role="tablist"
          aria-label="알림 필터"
          className="gap-1 px-6 max-md:px-[34px] my-[15px] flex"
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              id={`${id}-${tab.value}`}
              aria-controls={`${id}-panel`}
              aria-selected={notifications.filter === tab.value}
              tabIndex={notifications.filter === tab.value ? 0 : -1}
              onClick={() => notifications.handleFilterChange(tab.value)}
              onKeyDown={(event) => {
                const target =
                  event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? 1
                      : event.key === 'ArrowLeft' || event.key === 'ArrowRight'
                        ? 1 - index
                        : null
                if (target === null) return
                event.preventDefault()
                notifications.handleFilterChange(tabs[target].value)
                document.getElementById(`${id}-${tabs[target].value}`)?.focus()
              }}
              className={`gap-1 px-4 py-1.5 flex items-center justify-center rounded-control text-body font-medium transition-colors duration-200 motion-reduce:transition-none ${notifications.filter === tab.value ? 'bg-neutral-20 text-neutral-97' : 'bg-neutral-90 text-label-alternative hover:bg-fill-alternative'}`}
            >
              <span className="text-body font-medium">{tab.label}</span>
              {tab.value === 'UNREAD' && notifications.unreadCount > 0 && (
                <span className="text-body font-bold text-green-40">
                  {notifications.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <section
          role="tabpanel"
          id={`${id}-panel`}
          aria-labelledby={`${id}-${notifications.filter}`}
          tabIndex={0}
          className="px-3 pb-8 flex flex-1 flex-col outline-offset-2"
        >
          {notifications.isLoading && <ListSkeleton count={5} label="알림을 불러오는 중" />}
          {notifications.isError && (
            <StatusState
              isError
              title={notifications.errorMessage}
              onRetry={notifications.handleRetry}
              isRetrying={notifications.isFetching}
            />
          )}
          {notifications.openError && (
            <p role="alert" className="mb-4 px-6 text-label text-status-error">
              {notifications.openError}
            </p>
          )}
          {!notifications.isLoading &&
            !notifications.isError &&
            notifications.notifications.length === 0 && (
              <div
                role="status"
                className="gap-3 pb-16 flex flex-1 flex-col items-center justify-center"
              >
                <img src={emptyIcon} alt="" />
                <p className="text-body font-medium text-label-alternative opacity-50">
                  표시할 알림이 없어요.
                </p>
              </div>
            )}
          {notifications.notifications.length > 0 && (
            <ul className="gap-1.5 flex flex-col">
              {notifications.notifications.map((notification) => (
                <li key={notification.notificationId}>
                  <button
                    type="button"
                    onClick={() => void notifications.handleOpenNotification(notification)}
                    disabled={notifications.openingId !== null}
                    aria-busy={notifications.openingId === notification.notificationId}
                    className="gap-2.5 px-6 py-4 flex min-h-[82px] w-full items-center rounded-component bg-background-normal text-left shadow-surface-card transition-colors hover:bg-fill-normal disabled:cursor-wait"
                  >
                    <NotificationAvatar notification={notification} />
                    <span className="min-w-0 gap-1 flex flex-1 flex-col">
                      <span className="gap-3 flex items-center justify-between">
                        <span className="min-w-0 text-body font-bold break-words">
                          {getNotificationTitle(notification)}
                        </span>
                        <time
                          dateTime={notification.createdAt}
                          className={`shrink-0 text-label font-medium ${notification.read ? 'text-line-normal' : 'text-primary-normal'}`}
                        >
                          {formatNotificationTime(notification.createdAt)}
                        </time>
                      </span>
                      <span
                        className={`text-body break-words ${notification.read ? 'font-regular' : 'font-medium'}`}
                      >
                        {notification.message}
                      </span>
                    </span>
                    {notifications.openingId === notification.notificationId && <LoadingSpinner />}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {notifications.hasNextPage && (
            <button
              type="button"
              onClick={notifications.handleLoadMore}
              disabled={notifications.isFetchingNextPage}
              aria-busy={notifications.isFetchingNextPage}
              className="mt-5 gap-2 px-5 py-3 mx-auto flex items-center rounded-control bg-fill-neutral text-label font-bold disabled:opacity-50"
            >
              {notifications.isFetchingNextPage && <LoadingSpinner />}
              {notifications.isNextPageError ? '다시 불러오기' : '더 보기'}
            </button>
          )}
          {notifications.isNextPageError && (
            <p role="alert" className="mt-3 text-center text-label text-status-error">
              추가 알림을 불러오지 못했어요. 다시 시도해 주세요.
            </p>
          )}
          {!notifications.isLoading &&
            !notifications.isError &&
            notifications.notifications.length > 0 && (
              <p className="py-8 text-center text-caption font-medium text-label-alternative opacity-50">
                받은 알림은 3일 동안 표시됩니다.
              </p>
            )}
        </section>
      </div>
    </main>
  )
}
