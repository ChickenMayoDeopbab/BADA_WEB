import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCommunityComment,
  createCommunityPost,
  copyCommunityScenario,
  deleteCommunityComment,
  deleteCommunityPost,
  getCommunityComments,
  getCommunityPost,
  getCommunityPosts,
  getSavedCommunityScenarioKeys,
  setCommunityReaction,
  updateCommunityComment,
  updateCommunityPost,
} from '../api/communityApi'

const communityKeys = {
  posts: (mine: boolean, query: string) => ['community', 'posts', mine, query] as const,
  post: (postId: number) => ['community', 'post', postId] as const,
  comments: (postId: number) => ['community', 'comments', postId] as const,
  savedScenarios: ['community', 'saved-scenarios'] as const,
}

/** 검색 조건별 페이지를 보관하고 불러온 게시글을 이어 붙입니다. */
export const useCommunityPosts = (mine: boolean, query: string) => {
  const list = useInfiniteQuery({
    queryKey: communityKeys.posts(mine, query),
    queryFn: async ({ pageParam, signal }) => {
      const first = await getCommunityPosts(mine, query, pageParam, signal)
      if (!mine || !query) return first
      // 내 글 API는 q를 지원하지 않으므로 내 글 전체 페이지에서 검색합니다.
      let posts = first.posts
      let current = first
      while (current.hasNextPage) {
        current = await getCommunityPosts(true, '', current.page + 1, signal)
        posts = [...posts, ...current.posts]
      }
      const normalized = query.toLocaleLowerCase()
      return {
        ...first,
        hasNextPage: false,
        posts: posts.filter((post) =>
          `${post.title} ${post.content}`.toLocaleLowerCase().includes(normalized),
        ),
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
  })
  return { ...list, data: list.data?.pages.flatMap((page) => page.posts) }
}

export const useCommunityPost = (postId: number) =>
  useQuery({ queryKey: communityKeys.post(postId), queryFn: () => getCommunityPost(postId) })

export const useCommunityComments = (postId: number) =>
  useQuery({
    queryKey: communityKeys.comments(postId),
    queryFn: () => getCommunityComments(postId),
  })

export const useCreateCommunityPost = () =>
  useMutation({
    meta: {
      successMessage: '게시글을 등록했어요.',
      errorMessage: '게시글을 등록하지 못했어요. 입력 내용을 유지했으니 다시 시도해 주세요.',
    },
    mutationFn: createCommunityPost,
  })

export const useUpdateCommunityPost = (postId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    meta: {
      successMessage: '게시글을 수정했어요.',
      errorMessage: '게시글을 수정하지 못했어요. 다시 시도해 주세요.',
    },
    mutationFn: (input: Parameters<typeof updateCommunityPost>[1]) =>
      updateCommunityPost(postId, input),
    onSuccess: (post) => {
      queryClient.setQueryData(communityKeys.post(postId), post)
      void queryClient.invalidateQueries({ queryKey: ['community', 'posts'] })
    },
  })
}

export const useDeleteCommunityPost = (postId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    meta: {
      successMessage: '게시글을 삭제했어요.',
      errorMessage: '게시글을 삭제하지 못했어요. 다시 시도해 주세요.',
    },
    mutationFn: () => deleteCommunityPost(postId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: communityKeys.post(postId) })
      void queryClient.invalidateQueries({ queryKey: ['community', 'posts'] })
    },
  })
}

export const useCreateCommunityComment = (postId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    meta: {
      successMessage: '댓글을 등록했어요.',
      errorMessage: '댓글을 등록하지 못했어요. 다시 시도해 주세요.',
    },
    mutationFn: ({ content, parentCommentId }: { content: string; parentCommentId?: number }) =>
      createCommunityComment(postId, content, parentCommentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: communityKeys.comments(postId) }),
  })
}

export const useUpdateCommunityComment = (postId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    meta: {
      successMessage: '댓글을 수정했어요.',
      errorMessage: '댓글을 수정하지 못했어요. 다시 시도해 주세요.',
    },
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      updateCommunityComment(commentId, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: communityKeys.comments(postId) }),
  })
}

export const useDeleteCommunityComment = (postId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    meta: {
      successMessage: '댓글을 삭제했어요.',
      errorMessage: '댓글을 삭제하지 못했어요. 다시 시도해 주세요.',
    },
    mutationFn: (commentId: number) => deleteCommunityComment(commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: communityKeys.comments(postId) })
      void queryClient.invalidateQueries({ queryKey: communityKeys.post(postId) })
      void queryClient.invalidateQueries({ queryKey: ['community', 'posts'] })
    },
  })
}

export const useCommunityReaction = (postId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    meta: { errorMessage: '반응을 저장하지 못했어요. 다시 시도해 주세요.' },
    mutationFn: (kind: Parameters<typeof setCommunityReaction>[1]) =>
      setCommunityReaction(postId, kind),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: communityKeys.post(postId) })
      void queryClient.invalidateQueries({ queryKey: ['community', 'posts'] })
    },
  })
}

export const useSavedCommunityScenarioKeys = () =>
  useQuery({
    queryKey: communityKeys.savedScenarios,
    queryFn: getSavedCommunityScenarioKeys,
  })

export const useCopyCommunityScenario = (postId: number) => {
  const queryClient = useQueryClient()
  return useMutation({
    meta: {
      successMessage: '시나리오를 내 목록에 저장했어요.',
      errorMessage: '시나리오를 저장하지 못했어요. 다시 시도해 주세요.',
    },
    mutationFn: () => copyCommunityScenario(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: communityKeys.savedScenarios }),
  })
}
