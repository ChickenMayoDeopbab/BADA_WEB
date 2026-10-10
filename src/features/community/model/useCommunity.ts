import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCommunityComment,
  createCommunityPost,
  getCommunityComments,
  getCommunityPost,
  getCommunityPosts,
  setCommunityReaction,
} from '../api/communityApi'

const communityKeys = {
  posts: (mine: boolean, query: string) => ['community', 'posts', mine, query] as const,
  post: (postId: number) => ['community', 'post', postId] as const,
  comments: (postId: number) => ['community', 'comments', postId] as const,
}

export const useCommunityPosts = (mine: boolean, query: string) =>
  useQuery({
    queryKey: communityKeys.posts(mine, query),
    queryFn: () => getCommunityPosts(mine, query),
  })

export const useCommunityPost = (postId: number) =>
  useQuery({ queryKey: communityKeys.post(postId), queryFn: () => getCommunityPost(postId) })

export const useCommunityComments = (postId: number) =>
  useQuery({
    queryKey: communityKeys.comments(postId),
    queryFn: () => getCommunityComments(postId),
  })

export const useCreateCommunityPost = () => useMutation({ mutationFn: createCommunityPost })

export const useCreateCommunityComment = (postId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ content, parentCommentId }: { content: string; parentCommentId?: number }) =>
      createCommunityComment(postId, content, parentCommentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: communityKeys.comments(postId) }),
  })
}

export const useCommunityReaction = (postId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (kind: Parameters<typeof setCommunityReaction>[1]) =>
      setCommunityReaction(postId, kind),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: communityKeys.post(postId) }),
  })
}
