import { useBlockUser } from '@entities/user-block'
import { ConfirmDialog } from '@shared/ui'
import { useEffect, useRef, useState } from 'react'
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
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    const outside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [open])
  const block = useBlockUser()
  return (
    <div ref={menuRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={onReport ? `${name} ${reportTarget} 메뉴` : `${name} 사용자 메뉴`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="p-1 rounded-pill text-label-alternative hover:bg-fill-normal"
      >
        <FiMoreVertical className="size-5" />
      </button>
      {open && (
        <div className="right-0 top-8 w-40 absolute z-20 overflow-hidden rounded-control border border-line-alternative bg-background-normal shadow-elevated-card">
          {onReport && (
            <button
              type="button"
              className="px-3 py-2 block w-full text-left text-label hover:bg-fill-normal"
              onClick={() => {
                setOpen(false)
                triggerRef.current?.focus()
                onReport()
              }}
            >
              {reportTarget} 신고하기
            </button>
          )}
          <button
            type="button"
            disabled={block.isPending}
            className="px-3 py-2 block w-full text-left text-label text-status-error hover:bg-fill-normal"
            onClick={() => {
              setOpen(false)
              triggerRef.current?.focus()
              setConfirming(true)
            }}
          >
            {block.isPending ? '차단 중' : '사용자 차단하기'}
          </button>
        </div>
      )}
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
