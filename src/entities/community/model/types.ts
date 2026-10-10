export type ReactionKind = 'helpful' | 'empathy' | 'like'

export interface CommunityReply {
  id: string
  author: string
  content: string
  createdAt: string
}

export interface CommunityComment {
  id: string
  author: string
  content: string
  createdAt: string
  replies: CommunityReply[]
}

export interface CommunityPost {
  id: number
  author: string
  authorImage?: string | null
  title: string
  content: string
  views: number
  commentCount: number
  createdAt: string
  reactions: Record<ReactionKind, number>
  myReaction: ReactionKind | null
  comments: CommunityComment[]
  attachments: CommunityAttachment[]
}

export interface CommunityAttachment {
  id: number
  type: 'scenario' | 'record' | 'file'
  title: string
  detail: string
  imageUrl?: string | null
  url?: string | null
}
