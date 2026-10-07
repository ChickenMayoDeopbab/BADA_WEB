import { useBlockedUsers, useUnblockUser } from '@entities/user-block'
import { FiUsers, FiUser } from 'react-icons/fi'
import { ProfileBackLink } from './ProfileBackLink'
import { useState } from 'react'
import { ConfirmDialog } from '@shared/ui'

export const ProfileBlockedUsersPage = () => {
  const users = useBlockedUsers()
  const unblock = useUnblockUser()
  const [target, setTarget] = useState<{ id: number; name: string } | null>(null)
  return <main className="min-w-0 px-16 max-xl:px-6 max-md:px-4 max-md:pt-6 pt-9 pb-10 flex-1">
    <header className="gap-3 mb-5 flex flex-wrap items-center"><ProfileBackLink /><h1 className="text-title1 font-bold text-label-normal">차단 사용자 관리</h1></header>
    <div className="w-full max-w-[1024px] space-y-3">
      {users.isPending ? <p role="status">차단 목록을 불러오고 있습니다.</p> : users.isError ? <div role="alert">차단 목록을 불러오지 못했습니다.<button onClick={() => void users.refetch()} className="ml-3 text-primary-normal">다시 시도</button></div> : !users.data?.length ? <div className="py-20 flex flex-col items-center text-center"><FiUsers className="mb-5 size-12 text-label-alternative" /><h2 className="text-headline1 font-bold">차단한 사용자가 없어요</h2><p className="mt-3 text-label text-label-alternative">차단한 사용자가 생기면 이곳에서 관리할 수 있어요.</p></div> : users.data.map(user => <section key={user.user_id} className="gap-3 px-4 py-3 flex items-center rounded-card bg-background-normal shadow-subtle-card">
        <span className="size-10 flex shrink-0 items-center justify-center overflow-hidden rounded-component bg-fill-normal">{user.profile_image_url ? <img src={user.profile_image_url} alt="" className="size-full object-cover" /> : <FiUser className="size-5 text-label-alternative" />}</span>
        <div className="min-w-0 flex-1"><h2 className="text-body font-bold">{user.name || '이름 없는 사용자'}</h2><p className="mt-1 text-caption text-label-alternative">차단된 사용자</p></div>
        <button disabled={unblock.isPending} className="px-4 py-2 rounded-control bg-fill-normal text-label font-bold disabled:opacity-50" onClick={() => setTarget({id: user.user_id, name: user.name || '사용자'})}>차단 해제</button>
      </section>)}
      {unblock.isError && <p role="alert" className="text-label text-status-error">차단을 해제하지 못했습니다. 다시 시도해 주세요.</p>}
    </div>
    {target && <ConfirmDialog title={`${target.name}님의 차단을 해제할까요?`} description="차단을 해제하면 해당 사용자의 게시글과 댓글이 다시 표시됩니다." confirmLabel="해제하기" pending={unblock.isPending} onClose={() => setTarget(null)} onConfirm={() => unblock.mutate(target.id, {onSuccess: () => setTarget(null)})} />}
  </main>
}
