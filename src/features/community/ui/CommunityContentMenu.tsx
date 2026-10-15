import { useBlockUser } from '@entities/user-block'
import { ActionDropdown, ConfirmDialog } from '@shared/ui'
import { useState } from 'react'
import { FiMoreVertical } from 'react-icons/fi'

/** 다른 사람의 게시글·댓글 메뉴에서 콘텐츠 신고와 사용자 차단을 제공합니다. */
export const CommunityContentMenu = ({
  id,
  name,
  onBlocked,
  onReport,
  reportTarget = '게시글',
}: {
  id: number
  name: string
  onBlocked?: () => void
  onReport?: () => void
  reportTarget?: '게시글' | '댓글' | '답글'
}) => {
  const [confirming, setConfirming] = useState(false)
  const block = useBlockUser()
  return (
    <div>
      <ActionDropdown
        label={onReport ? `${name} ${reportTarget} 메뉴` : `${name} 사용자 메뉴`}
        icon={<FiMoreVertical className="size-5" />}
        items={[
          ...(onReport ? [{ label: `${reportTarget} 신고하기`, onSelect: onReport }] : []),
          {
            label: block.isPending ? '차단 중' : '사용자 차단하기',
            onSelect: () => setConfirming(true),
            isDisabled: block.isPending,
            isDanger: true,
          },
        ]}
      />
      {block.isError && (
        <p role="alert" className="text-caption text-status-error">
          차단하지 못했습니다. 다시 시도해 주세요.
        </p>
      )}
      {confirming && (
        <ConfirmDialog
          title={`${name}님을 차단할까요?`}
          description="차단하면 이 사용자의 게시글과 댓글이 표시되지 않습니다. 마이페이지의 차단 사용자 관리에서 언제든 해제할 수 있습니다."
          confirmLabel="차단하기"
          danger
          pending={block.isPending}
          error={block.isError ? '차단하지 못했습니다. 다시 시도해 주세요.' : undefined}
          onClose={() => setConfirming(false)}
          onConfirm={() =>
            block.mutate(id, {
              onSuccess: () => {
                setConfirming(false)
                onBlocked?.()
              },
            })
          }
        />
      )}
    </div>
  )
}
