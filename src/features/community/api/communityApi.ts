import type {
  CommunityAttachment,
  CommunityComment,
  CommunityPost,
  ReactionKind,
} from '@entities/community'
import { getProfileImageUrl } from '@entities/user'
import { aiHttpClient, httpClient } from '@shared/api'

type ApiReactionKind = 'CHEER' | 'RELATE' | 'LIKE'
type ApiAttachmentKind = 'SCENARIO' | 'TRAINING_RECORD' | 'FILE'
interface AuthorInfo {
  user_id: number
  name: string | null
  profile_image_url: string | null
}
interface ReactionCounts {
  cheer: number
  relate: number
  like: number
}
interface PostSummaryResponse {
  post_id: number
  title: string
  content_preview: string
  author: AuthorInfo
  view_count: number
  comment_count: number
  reactions: ReactionCounts
  my_reaction: ApiReactionKind | null
  created_at: string
}
interface PostAttachmentResponse {
  kind: ApiAttachmentKind
  ref_id: number
  scenario?: {
    title: string
    content?: string | null
    category: string
    scenario_image?: string | null
    is_mine?: boolean
  } | null
  training_record?: {
    scenario_name?: string | null
    duration_seconds?: number | null
    audio_url?: string | null
    audio_status?: string
  } | null
  file?: { title?: string | null; url?: string | null } | null
}
interface PostDetailResponse extends Omit<PostSummaryResponse, 'content_preview'> {
  content: string
  attachments: PostAttachmentResponse[]
}
interface PostListResponse {
  posts: PostSummaryResponse[]
}
interface CommentResponse {
  comment_id: number
  content: string
  author: AuthorInfo
  created_at: string
  replies?: CommentResponse[]
}
interface ScenarioResponse {
  scenario_id: number
  title: string
  category: string
  scenario_image: string | null
  practice_count: number
  is_custom: boolean
  is_copied?: boolean
}
interface SpringApiResponse<T> {
  data?: T
}
interface TrainingRecordSummary {
  recordId: number
  scenarioName: string
  durationSeconds: number
  trainedAt: string
  scenarioImage?: string | null
  categoryIconUrl?: string | null
}
interface TrainingRecordPage {
  content?: TrainingRecordSummary[]
}
interface TrainingRecordDetail {
  positiveFeedbacks?: unknown[]
}

export interface SelectableAttachment {
  id: number
  title: string
  detail: string
  imageUrl?: string | null
  iconUrl?: string | null
  trainedAt?: string
  feedbackCount?: number
  practiceCount?: number
  category?: string
}
export interface CreatePostInput {
  title: string
  content: string
  attachments: Array<{ kind: ApiAttachmentKind; ref_id: number }>
}
export interface UpdatePostInput {
  title: string
  content: string
  attachments: Array<{ kind: ApiAttachmentKind; ref_id: number }>
}

const reactionFromApi = (reaction?: ApiReactionKind | null): ReactionKind | null => {
  if (reaction === 'CHEER') return 'helpful'
  if (reaction === 'RELATE') return 'empathy'
  if (reaction === 'LIKE') return 'like'
  return null
}
const reactionToApi: Record<ReactionKind, ApiReactionKind> = {
  helpful: 'CHEER',
  empathy: 'RELATE',
  like: 'LIKE',
}
const authorName = (author: AuthorInfo) =>
  author.name ? `@${author.name}` : `@user${author.user_id}`
const formatRelativeTime = (value: string) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return '방금 전'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`
  return `${Math.floor(seconds / 86400)}일 전`
}
const mapAttachment = (item: PostAttachmentResponse): CommunityAttachment => {
  if (item.kind === 'SCENARIO')
    return {
      id: item.ref_id,
      type: 'scenario',
      title: item.scenario?.title ?? '시나리오',
      detail: item.scenario?.category ?? '',
      description: item.scenario?.content ?? '',
      imageUrl: item.scenario?.scenario_image,
      isMine: item.scenario?.is_mine ?? false,
    }
  if (item.kind === 'TRAINING_RECORD') {
    const seconds = item.training_record?.duration_seconds ?? 0
    return {
      id: item.ref_id,
      type: 'record',
      title: item.training_record?.scenario_name ?? '훈련 기록',
      detail: `${Math.floor(seconds / 60)}분 ${seconds % 60}초`,
      audioUrl: item.training_record?.audio_url,
      audioStatus: item.training_record?.audio_status,
      durationSeconds: seconds,
    }
  }
  return {
    id: item.ref_id,
    type: 'image',
    title: item.file?.title ?? '첨부 사진',
    detail: '',
    url: item.file?.url,
  }
}
const resolveProfileImageUrl = async (imageValue: string | null) => {
  if (!imageValue) return null
  if (/^https?:\/\//.test(imageValue)) return imageValue

  try {
    return await getProfileImageUrl(imageValue)
  } catch {
    return null
  }
}
const mapPost = (
  post: PostSummaryResponse | PostDetailResponse,
  authorImage: string | null,
): CommunityPost => ({
  id: post.post_id,
  authorId: post.author.user_id,
  author: authorName(post.author),
  authorImage,
  title: post.title,
  content: 'content' in post ? post.content : post.content_preview,
  views: post.view_count,
  commentCount: post.comment_count,
  createdAt: formatRelativeTime(post.created_at),
  reactions: {
    helpful: post.reactions?.cheer ?? 0,
    empathy: post.reactions?.relate ?? 0,
    like: post.reactions?.like ?? 0,
  },
  myReaction: reactionFromApi(post.my_reaction),
  comments: [],
  attachments: 'attachments' in post ? (post.attachments ?? []).map(mapAttachment) : [],
})
const mapComment = (comment: CommentResponse): CommunityComment => ({
  id: String(comment.comment_id),
  authorId: comment.author.user_id,
  author: authorName(comment.author),
  content: comment.content,
  createdAt: formatRelativeTime(comment.created_at),
  replies: (comment.replies ?? []).map((reply) => ({
    id: String(reply.comment_id),
    authorId: reply.author.user_id,
    author: authorName(reply.author),
    content: reply.content,
    createdAt: formatRelativeTime(reply.created_at),
  })),
})

export const getCommunityPosts = async (mine: boolean, query: string) => {
  const endpoint = mine ? '/api/v1/community/me/posts' : '/api/v1/community/posts'
  const response = await aiHttpClient.get<PostListResponse>(endpoint, {
    params: { page: 1, size: 50, ...(query && !mine ? { q: query } : {}) },
  })
  const imageValues = [...new Set(response.data.posts.map((post) => post.author.profile_image_url))]
  const resolvedImages = new Map(
    await Promise.all(
      imageValues.map(
        async (imageValue) => [imageValue, await resolveProfileImageUrl(imageValue)] as const,
      ),
    ),
  )

  return response.data.posts.map((post) =>
    mapPost(post, resolvedImages.get(post.author.profile_image_url) ?? null),
  )
}
export const getCommunityPost = async (postId: number) => {
  const post = (await aiHttpClient.get<PostDetailResponse>(`/api/v1/community/posts/${postId}`))
    .data
  return mapPost(post, await resolveProfileImageUrl(post.author.profile_image_url))
}
export const getCommunityComments = async (postId: number) =>
  (
    await aiHttpClient.get<{ comments: CommentResponse[] }>(
      `/api/v1/community/posts/${postId}/comments`,
    )
  ).data.comments.map(mapComment)
export const createCommunityPost = async (input: CreatePostInput) => {
  const post = (await aiHttpClient.post<PostDetailResponse>('/api/v1/community/posts', input)).data
  return mapPost(post, await resolveProfileImageUrl(post.author.profile_image_url))
}
export const updateCommunityPost = async (postId: number, input: UpdatePostInput) => {
  const post = (
    await aiHttpClient.patch<PostDetailResponse>(`/api/v1/community/posts/${postId}`, input)
  ).data
  return mapPost(post, await resolveProfileImageUrl(post.author.profile_image_url))
}
export const deleteCommunityPost = async (postId: number) => {
  await aiHttpClient.delete(`/api/v1/community/posts/${postId}`)
}
export const createCommunityComment = async (
  postId: number,
  content: string,
  parentCommentId?: number,
) => {
  await aiHttpClient.post(`/api/v1/community/posts/${postId}/comments`, {
    content,
    parent_comment_id: parentCommentId ?? null,
  })
}
export const updateCommunityComment = async (commentId: number, content: string) => {
  await aiHttpClient.patch(`/api/v1/community/comments/${commentId}`, { content })
}
export const deleteCommunityComment = async (commentId: number) => {
  await aiHttpClient.delete(`/api/v1/community/comments/${commentId}`)
}
export const setCommunityReaction = async (postId: number, kind: ReactionKind | null) => {
  if (kind)
    await aiHttpClient.put(`/api/v1/community/posts/${postId}/reaction`, {
      kind: reactionToApi[kind],
    })
  else await aiHttpClient.delete(`/api/v1/community/posts/${postId}/reaction`)
}
export const getSavedCommunityScenarioKeys = async () => {
  const response = await aiHttpClient.get<{ scenarios: ScenarioResponse[] }>(
    '/api/v1/scenario/scenarios',
  )
  return response.data.scenarios
    .filter((scenario) => scenario.is_custom && scenario.is_copied)
    .map((scenario) => `${scenario.category}:${scenario.title}`)
}
export const copyCommunityScenario = async (postId: number) => {
  await aiHttpClient.post(`/api/v1/community/posts/${postId}/scenario/copy`)
}
export const getAttachableTrainingRecords = async (): Promise<SelectableAttachment[]> => {
  const response = await httpClient.get<SpringApiResponse<TrainingRecordPage>>(
    '/api/v1/training-records',
    { params: { page: 0, size: 20 } },
  )
  return Promise.all(
    (response.data.data?.content ?? []).map(async (item) => {
      const detail = await httpClient
        .get<SpringApiResponse<TrainingRecordDetail>>(`/api/v1/training-records/${item.recordId}`)
        .then(({ data }) => data.data)
        .catch(() => undefined)

      return {
        id: item.recordId,
        title: item.scenarioName,
        detail: `${Math.floor(item.durationSeconds / 60)}분 ${item.durationSeconds % 60}초`,
        imageUrl: item.scenarioImage,
        iconUrl: item.categoryIconUrl,
        trainedAt: item.trainedAt,
        feedbackCount: detail?.positiveFeedbacks?.length,
      }
    }),
  )
}
export const getAttachableScenarios = async (): Promise<SelectableAttachment[]> => {
  const response = await aiHttpClient.get<{ scenarios: ScenarioResponse[] }>(
    '/api/v1/scenario/scenarios',
  )
  return response.data.scenarios
    .filter((item) => item.is_custom)
    .map((item) => ({
      id: item.scenario_id,
      title: item.title,
      detail: `${item.category} · ${item.practice_count}회`,
      imageUrl: item.scenario_image,
      practiceCount: item.practice_count,
      category: item.category,
    }))
}
export const uploadCommunityImage = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 첨부할 수 있어요.')
  }

  const formData = new FormData()
  formData.append('file', file)
  const response = await httpClient.post<SpringApiResponse<{ fileId: number }>>(
    '/api/v1/file/upload',
    formData,
    { params: { fileType: 'COMMUNITY_IMAGE' }, headers: { 'Content-Type': 'multipart/form-data' } },
  )
  const fileId = response.data.data?.fileId
  if (!fileId) throw new Error('파일 업로드 응답에 fileId가 없습니다.')
  return fileId
}
