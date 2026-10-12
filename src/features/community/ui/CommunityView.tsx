import type { CommunityAttachment, CommunityPost, ReactionKind } from '@entities/community'
import scenarioImage from '@shared/assets/community/figma-1.png'
import defaultProfileSummary from '@shared/assets/profile/default-profile-summary.svg'
import { routePaths } from '@shared/config'
import { useEffect, useRef, useState } from 'react'
import {
  FiArrowLeft,
  FiChevronDown,
  FiEye,
  FiMessageCircle,
  FiMoreVertical,
  FiPaperclip,
  FiSearch,
  FiSend,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getAttachableScenarios,
  getAttachableTrainingRecords,
  uploadCommunityImage,
} from '../api/communityApi'
import {
  useCommunityComments,
  useCommunityPost,
  useCommunityPosts,
  useCommunityReaction,
  useCreateCommunityComment,
  useCreateCommunityPost,
  useDeleteCommunityComment,
  useDeleteCommunityPost,
  useUpdateCommunityComment,
  useUpdateCommunityPost,
} from '../model/useCommunity'
import { getCurrentUserId } from '@shared/lib'

const reactionMeta: Record<ReactionKind, { emoji: string; label: string }> = {
  helpful: { emoji: '👍', label: '힘내요' },
  empathy: { emoji: '🥺', label: '공감돼요' },
  like: { emoji: '❤️', label: '좋아요' },
}

const Profile = ({
  author,
  imageUrl,
  large = false,
}: {
  author: string
  imageUrl?: string | null
  large?: boolean
}) => {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null)
  const sizeClassName = large ? 'size-6' : 'size-5'

  return (
    <div className="gap-1.5 flex items-center text-label text-label-alternative">
      {imageUrl && imageUrl !== failedImageUrl ? (
        <img
          className={`${sizeClassName} rounded-pill object-cover`}
          src={imageUrl}
          alt=""
          onError={() => setFailedImageUrl(imageUrl)}
        />
      ) : (
        <span
          className={`${sizeClassName} flex shrink-0 items-center justify-center rounded-pill bg-fill-normal`}
          aria-hidden="true"
        >
          <img className={large ? 'size-4' : 'size-3.5'} src={defaultProfileSummary} alt="" />
        </span>
      )}
      <span>{author}</span>
    </div>
  )
}

const CommunityHeader = () => (
  <header className="gap-3 flex items-center">
    <h1 className="text-title1 font-bold text-label-normal">커뮤니티</h1>
    <p className="text-body font-medium text-neutral-60">
      서로의 경험과 팁, 도움됐던 시나리오를 공유해요!
    </p>
  </header>
)

const Reactions = ({
  post,
  interactive = false,
}: {
  post: CommunityPost
  interactive?: boolean
}) => {
  const reaction = useCommunityReaction(post.id)
  const selected = post.myReaction

  return (
    <div className="gap-2 flex items-center">
      {(Object.keys(reactionMeta) as ReactionKind[]).map((kind) => {
        const meta = reactionMeta[kind]
        const content = (
          <>
            <span>{meta.emoji}</span>
            {interactive && <span>{meta.label}</span>}
            <span>{post.reactions[kind]}</span>
          </>
        )

        if (!interactive) {
          return (
            <span
              key={kind}
              className="gap-1 px-2 py-1 flex items-center rounded-control border border-line-alternative bg-background-normal text-caption text-label-alternative"
            >
              {content}
            </span>
          )
        }

        return (
          <button
            key={kind}
            type="button"
            onClick={() => reaction.mutate(selected === kind ? null : kind)}
            disabled={reaction.isPending}
            className={`gap-1 px-2 py-1 flex items-center rounded-control border text-caption ${selected === kind ? 'text-white border-primary-normal bg-primary-normal' : 'border-line-alternative bg-background-normal text-label-alternative'}`}
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}

const CommunityList = () => {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'all' | 'mine'>('all')
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const { data: posts = [], isLoading, isError } = useCommunityPosts(tab === 'mine', query.trim())

  return (
    <div className="py-5 px-12 min-w-0 flex min-h-[calc(100vh-32px)] flex-1 flex-col">
      <CommunityHeader />
      <div className="mt-5 flex items-end justify-between">
        <div className="gap-4 flex">
          {(['all', 'mine'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`pb-1 text-title2 font-medium ${tab === value ? 'border-b-2 border-green-40 text-green-40' : 'text-neutral-70'}`}
            >
              {value === 'all' ? '전체 글' : '내 글'}
            </button>
          ))}
        </div>
        <div className="relative w-[300px]">
          <label className="h-12 gap-2 px-3 flex items-center rounded-component bg-fill-alternative">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => window.setTimeout(() => setFocused(false), 120)}
              className="min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-neutral-60"
              placeholder="제목 또는 설명으로 검색"
            />
            <FiSearch className="size-6 text-label-alternative" />
          </label>
          {focused && query && (
            <div className="top-14 absolute z-10 w-full overflow-hidden rounded-control border border-line-alternative bg-background-normal shadow-elevated-card">
              {Array.from({ length: 4 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className="px-3 py-2 flex w-full items-center justify-between text-body hover:bg-fill-normal"
                >
                  <span>{query}</span>
                  <FiX className="text-neutral-60" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 gap-3 pb-16 flex flex-1 flex-col overflow-auto">
        {isLoading && (
          <p className="py-12 text-center text-label-alternative">게시글을 불러오는 중이에요.</p>
        )}
        {isError && (
          <p className="py-12 text-center text-status-error">게시글을 불러오지 못했어요.</p>
        )}
        {!isLoading && !isError && posts.length === 0 && (
          <p className="py-12 text-center text-label-alternative">아직 게시글이 없어요.</p>
        )}
        {posts.map((post) => (
          <button
            type="button"
            key={post.id}
            onClick={() => navigate(`/community/${post.id}`)}
            className="py-3 hover:-translate-y-0.5 flex flex-col rounded-component bg-background-normal px-[22px] text-left shadow-surface-card transition-transform"
          >
            <Profile author={post.author} imageUrl={post.authorImage} />
            <strong className="mt-1 text-headline2 text-label-normal">{post.title}</strong>
            <div className="mt-2 flex w-full items-center justify-between">
              <div className="gap-3 flex items-center text-label text-label-alternative">
                <span className="gap-1 flex items-center">
                  <FiEye /> {post.views}
                </span>
                <span className="gap-1 flex items-center">
                  <FiMessageCircle /> {post.commentCount}
                </span>
                <span>{post.createdAt}</span>
              </div>
              <Reactions post={post} />
            </div>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => navigate(routePaths.communityNew)}
        className="right-12 bottom-7 px-7 py-3 text-white fixed rounded-control bg-green-40 text-body font-medium shadow-elevated-card"
      >
        게시글 작성
      </button>
    </div>
  )
}

const AttachmentCard = ({ attachment }: { attachment: CommunityAttachment }) => {
  const isScenario = attachment.type === 'scenario'
  return (
    <div
      className={`mt-5 px-3 py-2.5 overflow-hidden rounded-component border border-line-alternative ${isScenario ? 'text-white relative bg-secondary-normal' : 'bg-background-normal'}`}
    >
      {isScenario && (
        <img
          src={attachment.imageUrl || scenarioImage}
          alt=""
          className="inset-0 absolute size-full object-cover opacity-35"
        />
      )}
      <div className="relative flex items-center justify-between">
        <div>
          <strong className="block text-body">{attachment.title}</strong>
          <span className="text-caption opacity-80">{attachment.detail}</span>
        </div>
        <button
          type="button"
          className="px-3 py-1 border-white/40 rounded-control border text-label"
        >
          {isScenario ? '저장하기 〉' : attachment.type === 'file' ? '열기 〉' : '훈련 기록'}
        </button>
      </div>
    </div>
  )
}

const ActionMenu = ({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="더보기"
        onClick={() => setIsOpen((value) => !value)}
        className="p-1 rounded-pill text-label-alternative hover:bg-fill-normal"
      >
        <FiMoreVertical className="size-5" />
      </button>
      {isOpen && (
        <div className="right-0 top-8 w-24 absolute z-20 overflow-hidden rounded-control border border-line-alternative bg-background-normal shadow-elevated-card">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              onEdit()
            }}
            className="px-3 py-2 block w-full text-left text-label hover:bg-fill-normal"
          >
            수정
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              onDelete()
            }}
            className="px-3 py-2 block w-full text-left text-label text-status-error hover:bg-fill-normal"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  )
}

const ConfirmDeleteModal = ({
  target,
  isPending,
  onClose,
  onConfirm,
}: {
  target: '게시글' | '댓글'
  isPending: boolean
  onClose: () => void
  onConfirm: () => void
}) => (
  <div
    className="inset-0 bg-black/30 fixed z-40 flex items-center justify-center"
    role="presentation"
  >
    <div
      className="p-6 w-[360px] rounded-dialog bg-background-normal shadow-elevated-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <h3 id="delete-modal-title" className="text-center text-headline1 font-bold">
        정말 {target}을 삭제하시겠습니까?
      </h3>
      <p className="mt-2 text-center text-label text-label-alternative">
        삭제한 내용은 다시 복구할 수 없어요.
      </p>
      <div className="gap-2 mt-6 flex w-full">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="px-5 py-2.5 flex-1 rounded-control bg-fill-normal text-label"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className="px-5 py-2.5 text-white flex-1 rounded-control bg-status-error text-label disabled:opacity-40"
        >
          {isPending ? '삭제 중...' : '삭제'}
        </button>
      </div>
    </div>
  </div>
)

const EditModal = ({
  title,
  initialTitle,
  initialContent,
  isPending,
  onClose,
  onSave,
}: {
  title: string
  initialTitle?: string
  initialContent: string
  isPending: boolean
  onClose: () => void
  onSave: (value: { title?: string; content: string }) => void
}) => {
  const [editedTitle, setEditedTitle] = useState(initialTitle ?? '')
  const [editedContent, setEditedContent] = useState(initialContent)
  const canSave =
    editedContent.trim().length > 0 && (initialTitle === undefined || editedTitle.trim().length > 0)

  return (
    <div
      className="inset-0 bg-black/30 fixed z-40 flex items-center justify-center"
      role="presentation"
    >
      <div
        className="p-6 w-[480px] rounded-dialog bg-background-normal shadow-elevated-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
      >
        <div className="flex items-center justify-between">
          <h3 id="edit-modal-title" className="text-headline1 font-bold">
            {title}
          </h3>
          <button type="button" aria-label="닫기" onClick={onClose} disabled={isPending}>
            <FiX className="size-6" />
          </button>
        </div>
        {initialTitle !== undefined && (
          <input
            value={editedTitle}
            onChange={(event) => setEditedTitle(event.target.value)}
            className="mt-4 px-3 h-12 block w-full rounded-control bg-fill-field outline-primary-normal"
            aria-label="게시물 제목"
          />
        )}
        <textarea
          value={editedContent}
          onChange={(event) => setEditedContent(event.target.value)}
          className="mt-3 p-3 min-h-40 block w-full resize-none rounded-control bg-fill-field outline-primary-normal"
          aria-label={initialTitle === undefined ? '댓글 내용' : '게시물 본문'}
        />
        <div className="gap-2 mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-5 py-2.5 rounded-control bg-fill-normal text-label"
          >
            취소
          </button>
          <button
            type="button"
            disabled={!canSave || isPending}
            onClick={() =>
              onSave({
                ...(initialTitle !== undefined ? { title: editedTitle.trim() } : {}),
                content: editedContent.trim(),
              })
            }
            className="px-5 py-2.5 text-white rounded-control bg-primary-normal text-label disabled:opacity-40"
          >
            {isPending ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

const PostDetail = ({ post }: { post: CommunityPost }) => {
  const navigate = useNavigate()
  const currentUserId = getCurrentUserId()
  const [expanded, setExpanded] = useState<string[]>([])
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null)
  const [deletingTarget, setDeletingTarget] = useState<
    { type: 'post' } | { type: 'comment'; id: string } | null
  >(null)
  const { data: comments = [], isLoading: areCommentsLoading } = useCommunityComments(post.id)
  const createComment = useCreateCommunityComment(post.id)
  const deletePost = useDeleteCommunityPost(post.id)
  const updateComment = useUpdateCommunityComment(post.id)
  const deleteComment = useDeleteCommunityComment(post.id)

  const submitComment = () => {
    if (!comment.trim()) return
    createComment.mutate(
      { content: comment.trim(), parentCommentId: replyTo ? Number(replyTo) : undefined },
      {
        onSuccess: () => {
          setComment('')
          setReplyTo(null)
        },
      },
    )
  }

  return (
    <div className="py-5 px-12 min-w-0 flex min-h-[calc(100vh-32px)] flex-1 flex-col">
      <CommunityHeader />
      <button
        type="button"
        onClick={() => navigate(routePaths.community)}
        className="gap-2 mt-4 flex w-fit items-center text-body text-label-neutral"
      >
        <span className="p-1 rounded-pill bg-fill-alternative">
          <FiArrowLeft />
        </span>
        전체 글
      </button>
      <div className="gap-4 mt-4 grid flex-1 grid-cols-[minmax(520px,1fr)_230px]">
        <article className="p-5 flex min-h-[580px] flex-col rounded-component bg-background-normal shadow-surface-card">
          <div className="flex items-start justify-between">
            <h2 className="text-title2 font-bold">{post.title}</h2>
            {post.authorId === currentUserId && (
              <ActionMenu
                onEdit={() => navigate(`/community/${post.id}/edit`)}
                onDelete={() => setDeletingTarget({ type: 'post' })}
              />
            )}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <Profile author={post.author} imageUrl={post.authorImage} large />
            <div className="gap-2 flex text-label text-label-alternative">
              <FiEye /> {post.views}
              <FiMessageCircle /> {post.commentCount}
              <span>{post.createdAt}</span>
            </div>
          </div>
          <hr className="my-4 border-line-alternative" />
          <p className="leading-relaxed text-body whitespace-pre-line">{post.content}</p>
          {post.attachments.map((attachment) => (
            <AttachmentCard key={`${attachment.type}-${attachment.id}`} attachment={attachment} />
          ))}
          <div className="mt-8 flex justify-end">
            <Reactions post={post} interactive />
          </div>
        </article>
        <aside className="p-4 h-fit rounded-component bg-background-normal shadow-surface-card">
          <h3 className="text-headline2 font-bold">
            댓글{' '}
            <span className="ml-1 font-regular text-label-alternative">{post.commentCount}</span>
          </h3>
          <div className="divide-y divide-line-alternative">
            {areCommentsLoading && (
              <p className="py-4 text-label text-label-alternative">댓글을 불러오는 중이에요.</p>
            )}
            {comments.map((item) => {
              const isExpanded = expanded.includes(item.id)
              return (
                <div key={item.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <Profile author={item.author} />
                    {item.authorId === currentUserId && (
                      <ActionMenu
                        onEdit={() => setEditingComment({ id: item.id, content: item.content })}
                        onDelete={() => setDeletingTarget({ type: 'comment', id: item.id })}
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyTo(item.id)}
                    className={`mt-2 block text-left text-label ${replyTo === item.id ? 'text-status-info' : ''}`}
                  >
                    {item.content}
                  </button>
                  {item.replies.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((items) =>
                          isExpanded ? items.filter((id) => id !== item.id) : [...items, item.id],
                        )
                      }
                      className="mt-2 text-caption text-label-alternative"
                    >
                      ↳ 답글 {isExpanded ? '숨기기' : `${item.replies.length}개 보기`}
                    </button>
                  )}
                  {isExpanded &&
                    item.replies.map((reply) => (
                      <div key={reply.id} className="mt-2 pl-5">
                        <div className="flex items-center justify-between">
                          <Profile author={reply.author} />
                          {reply.authorId === currentUserId && (
                            <ActionMenu
                              onEdit={() =>
                                setEditingComment({ id: reply.id, content: reply.content })
                              }
                              onDelete={() => setDeletingTarget({ type: 'comment', id: reply.id })}
                            />
                          )}
                        </div>
                        <p className="mt-1 text-label">{reply.content}</p>
                      </div>
                    ))}
                </div>
              )
            })}
          </div>
          <div className="mt-2">
            {replyTo && (
              <div className="px-2 py-1 flex justify-between rounded-t-control border border-line-alternative text-caption">
                <span>↪ {comments.find((item) => item.id === replyTo)?.author}에게 답글</span>
                <button type="button" onClick={() => setReplyTo(null)}>
                  취소
                </button>
              </div>
            )}
            <label className="px-3 py-2 flex items-center rounded-component bg-fill-field text-label-disabled">
              <input
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="댓글을 입력해주세요."
                className="min-w-0 flex-1 bg-transparent text-label text-label-normal outline-none"
              />
              <button
                type="button"
                aria-label="댓글 등록"
                onClick={submitComment}
                disabled={!comment.trim() || createComment.isPending}
              >
                <FiSend className="size-5" />
              </button>
            </label>
          </div>
        </aside>
      </div>
      {editingComment && (
        <EditModal
          title="댓글 수정"
          initialContent={editingComment.content}
          isPending={updateComment.isPending}
          onClose={() => setEditingComment(null)}
          onSave={({ content }) =>
            updateComment.mutate(
              { commentId: Number(editingComment.id), content },
              { onSuccess: () => setEditingComment(null) },
            )
          }
        />
      )}
      {deletingTarget && (
        <ConfirmDeleteModal
          target={deletingTarget.type === 'post' ? '게시글' : '댓글'}
          isPending={deletePost.isPending || deleteComment.isPending}
          onClose={() => setDeletingTarget(null)}
          onConfirm={() => {
            if (deletingTarget.type === 'post') {
              deletePost.mutate(undefined, {
                onSuccess: () => navigate(routePaths.community),
              })
              return
            }
            deleteComment.mutate(Number(deletingTarget.id), {
              onSuccess: () => setDeletingTarget(null),
            })
          }}
        />
      )}
    </div>
  )
}

type Attachment = { id: number; type: 'file' | 'record' | 'scenario'; title: string }

const SelectionModal = ({
  type,
  onClose,
  onSelect,
}: {
  type: 'record' | 'scenario'
  onClose: () => void
  onSelect: (attachment: Attachment) => void
}) => {
  const [records, setRecords] = useState<Array<{ id: number; title: string; detail: string }>>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const request = type === 'record' ? getAttachableTrainingRecords() : getAttachableScenarios()
    request
      .then(setRecords)
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false))
  }, [type])

  return (
    <div className="inset-0 bg-black/30 fixed z-30 flex items-center justify-center">
      <div className="p-5 flex h-[514px] w-[544px] flex-col rounded-component bg-background-normal shadow-elevated-card">
        <div className="flex justify-between">
          <div>
            <h3 className="text-headline1 font-bold">
              첨부 {type === 'record' ? '훈련기록' : '시나리오'} 선택
            </h3>
            <p className="mt-1 text-label text-label-alternative">
              게시글에 함께 보여줄 항목을 선택해 주세요.
            </p>
          </div>
          <button type="button" onClick={onClose}>
            <FiX className="size-6" />
          </button>
        </div>
        {type === 'scenario' && (
          <button
            type="button"
            className="gap-2 mt-3 px-3 py-2 ml-auto flex items-center rounded-control bg-fill-normal text-label"
          >
            전체 <FiChevronDown />
          </button>
        )}
        <div className="mt-3 gap-2 flex flex-col">
          {isLoading && (
            <p className="py-6 text-center text-label-alternative">목록을 불러오는 중이에요.</p>
          )}
          {hasError && (
            <p className="py-6 text-center text-status-error">목록을 불러오지 못했어요.</p>
          )}
          {!isLoading && !hasError && records.length === 0 && (
            <p className="py-6 text-center text-label-alternative">첨부할 항목이 없어요.</p>
          )}
          {records.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item.id)}
              className={`p-3 flex items-center justify-between rounded-component border ${selected === item.id ? 'border-primary-normal' : 'border-line-alternative'} ${type === 'scenario' ? 'text-white bg-secondary-normal' : ''}`}
            >
              <div className="text-left">
                <strong className="block text-body">
                  {type === 'record' ? '🍕 ' : ''}
                  {item.title}
                </strong>
                <span className="text-caption opacity-70">{item.detail}</span>
              </div>
              <span
                className={`size-6 rounded-pill border-2 ${selected === item.id ? 'border-primary-normal bg-primary-normal' : 'border-line-normal'}`}
              >
                ✓
              </span>
            </button>
          ))}
        </div>
        <div className="gap-2 mt-auto flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 rounded-control bg-fill-normal"
          >
            취소
          </button>
          <button
            type="button"
            disabled={!selected}
            onClick={() => {
              const item = records.find((record) => record.id === selected)
              if (item) onSelect({ id: item.id, type, title: item.title })
            }}
            className="px-6 py-3 text-white rounded-control bg-primary-normal disabled:opacity-40"
          >
            선택 {type === 'record' ? '훈련기록' : '시나리오'} 첨부
          </button>
        </div>
      </div>
    </div>
  )
}

const PostComposer = ({ post }: { post?: CommunityPost }) => {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [modal, setModal] = useState<'record' | 'scenario' | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>(() =>
    (post?.attachments ?? []).map((attachment) => ({
      id: attachment.id,
      type: attachment.type,
      title: attachment.title,
    })),
  )
  const [title, setTitle] = useState(post?.title ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const createPost = useCreateCommunityPost()
  const updatePost = useUpdateCommunityPost(post?.id ?? 0)
  const isEditing = Boolean(post)
  const isPending = createPost.isPending || updatePost.isPending
  const returnPath = post ? `/community/${post.id}` : routePaths.community

  const handleFile = async (file?: File) => {
    if (!file) return
    const fileId = await uploadCommunityImage(file)
    setAttachments((items) => [...items, { id: fileId, type: 'file', title: file.name }])
  }

  const submitPost = () => {
    const input = {
      title: title.trim(),
      content: content.trim(),
      attachments: attachments.map((item) => ({
        kind:
          item.type === 'scenario'
            ? ('SCENARIO' as const)
            : item.type === 'record'
              ? ('TRAINING_RECORD' as const)
              : ('FILE' as const),
        ref_id: item.id,
      })),
    }

    if (post) {
      updatePost.mutate(input, { onSuccess: () => navigate(`/community/${post.id}`) })
      return
    }
    createPost.mutate(input, {
      onSuccess: (createdPost) => navigate(`/community/${createdPost.id}`),
    })
  }

  return (
    <div className="py-5 px-12 min-w-0 flex min-h-[calc(100vh-32px)] flex-1 flex-col">
      <CommunityHeader />
      <button
        type="button"
        onClick={() => navigate(returnPath)}
        className="gap-2 mt-4 flex w-fit items-center text-body"
      >
        <FiArrowLeft /> {isEditing ? '게시글로 돌아가기' : '전체 글'}
      </button>
      <div className="gap-4 mt-4 grid flex-1 grid-cols-[minmax(520px,1fr)_230px]">
        <section className="p-5 flex flex-col rounded-component bg-background-normal shadow-surface-card">
          <h2 className="text-title2 font-bold">{isEditing ? '게시물 수정' : '새 게시물 작성'}</h2>
          <label className="mt-4 text-label font-medium">
            게시물 제목
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="게시물 제목을 입력해주세요."
              className="mt-2 px-3 h-12 block w-full rounded-control bg-fill-normal outline-primary-normal"
            />
          </label>
          <label className="mt-4 flex flex-1 flex-col text-label font-medium">
            게시물 본문
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="게시물 본문을 입력해주세요."
              className="mt-2 p-3 min-h-[300px] flex-1 resize-none rounded-control bg-fill-normal outline-primary-normal"
            />
          </label>
          <div className="gap-2 mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => navigate(returnPath)}
              className="px-8 py-3 rounded-control bg-fill-normal"
            >
              취소
            </button>
            <button
              type="button"
              disabled={!title.trim() || !content.trim() || isPending}
              onClick={submitPost}
              className="px-8 py-3 text-white rounded-control bg-primary-normal disabled:opacity-40"
            >
              {isPending ? '저장 중...' : isEditing ? '수정하기' : '등록하기'}
            </button>
          </div>
        </section>
        <aside className="p-4 h-fit rounded-component bg-background-normal shadow-surface-card">
          <div className="relative flex items-center justify-between">
            <h3 className="text-label font-bold">첨부요소</h3>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="px-3 py-2 rounded-control border border-line-alternative text-caption"
            >
              추가하기 +
            </button>
            {menuOpen && (
              <div className="right-0 top-11 absolute z-10 w-[120px] overflow-hidden rounded-control bg-background-normal shadow-elevated-card">
                {[
                  { label: '파일', type: 'file' },
                  { label: '내 커스텀 시나리오', type: 'scenario' },
                  { label: '내 훈련기록', type: 'record' },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      if (item.type === 'file') fileRef.current?.click()
                      else setModal(item.type as 'record' | 'scenario')
                    }}
                    className="px-3 py-3 block w-full text-left text-caption hover:bg-fill-normal"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
          <div className="mt-3 gap-2 p-2 flex min-h-[52px] flex-col rounded-control bg-fill-normal">
            {attachments.length === 0 ? (
              <p className="py-3 text-center text-caption text-label-alternative">
                아직 추가한 요소가 없어요.
              </p>
            ) : (
              attachments.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center justify-between text-caption"
                >
                  <span className="gap-1 min-w-0 flex items-center">
                    <FiPaperclip /> <span className="truncate">{item.title}</span>
                  </span>
                  <button
                    type="button"
                    aria-label="첨부 삭제"
                    onClick={() =>
                      setAttachments((items) =>
                        items.filter((attachment) => attachment.id !== item.id),
                      )
                    }
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
      {modal && (
        <SelectionModal
          type={modal}
          onClose={() => setModal(null)}
          onSelect={(attachment) => {
            setAttachments((items) => [...items, attachment])
            setModal(null)
          }}
        />
      )}
    </div>
  )
}

const CommunityDetailRoute = ({ postId }: { postId: number }) => {
  const { data: post, isLoading, isError } = useCommunityPost(postId)

  if (isLoading)
    return <div className="p-12 flex-1 text-label-alternative">게시글을 불러오는 중이에요.</div>
  if (isError || !post)
    return <div className="p-12 flex-1 text-status-error">게시글을 불러오지 못했어요.</div>
  return <PostDetail post={post} />
}

const CommunityEditRoute = ({ postId }: { postId: number }) => {
  const { data: post, isLoading, isError } = useCommunityPost(postId)

  if (isLoading)
    return <div className="p-12 flex-1 text-label-alternative">게시글을 불러오는 중이에요.</div>
  if (isError || !post)
    return <div className="p-12 flex-1 text-status-error">게시글을 불러오지 못했어요.</div>
  if (post.authorId !== getCurrentUserId())
    return <div className="p-12 flex-1 text-status-error">게시글 수정 권한이 없어요.</div>
  return <PostComposer post={post} />
}

export const CommunityView = () => {
  const { postId } = useParams()
  const isComposer = window.location.pathname === routePaths.communityNew
  const isEditing = window.location.pathname.endsWith('/edit')
  if (isComposer) return <PostComposer />
  if (postId && isEditing) return <CommunityEditRoute postId={Number(postId)} />
  if (postId) return <CommunityDetailRoute postId={Number(postId)} />
  return <CommunityList />
}
