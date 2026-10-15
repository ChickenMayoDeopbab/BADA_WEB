import { useTranslation } from '@shared/lib'
import type { ReactNode } from 'react'
import { useIsMutating } from '@tanstack/react-query'
import { getApiErrorMessage } from '@shared/api'
import { LoadingSpinner } from '@shared/ui'
import { logoutMutationKey, useLogout } from '../model/useLogout'

interface LogoutButtonProps {
  className?: string
  icon?: ReactNode
}

/** 데스크톱·모바일에서 서버 로그아웃과 진행/실패 상태를 동일하게 제공합니다. */
export const LogoutButton = ({
  className = 'gap-2 px-5 h-11 flex items-center justify-center rounded-component border border-line-neutral text-label font-medium text-label-normal hover:bg-fill-normal disabled:opacity-50',
  icon,
}: LogoutButtonProps) => {
  const { t } = useTranslation()

  const logout = useLogout()
  const isLoggingOut = useIsMutating({ mutationKey: logoutMutationKey }) > 0

  return (
    <div>
      <button
        type="button"
        disabled={isLoggingOut}
        aria-busy={isLoggingOut}
        onClick={() => {
          if (!isLoggingOut) logout.mutate()
        }}
        className={className}
      >
        {isLoggingOut ? <LoadingSpinner /> : icon}
        <span>{isLoggingOut ? '로그아웃 중...' : t('로그아웃')}</span>
      </button>
      {logout.isError && (
        <p role="alert" className="px-2 py-2 text-caption text-status-error">
          {getApiErrorMessage(logout.error, '로그아웃하지 못했어요. 다시 시도해 주세요.')}
        </p>
      )}
    </div>
  )
}
